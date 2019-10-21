
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/components/Camera.svelte generated by Svelte v3.12.1 */

    const file = "src/components/Camera.svelte";

    function create_fragment(ctx) {
    	var video_1, video_1_class_value, t0, canvas, t1, div, t2, ul, li0, li0_class_value, li1, li1_class_value, dispose;

    	const block = {
    		c: function create() {
    			video_1 = element("video");
    			t0 = space();
    			canvas = element("canvas");
    			t1 = space();
    			div = element("div");
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li1 = element("li");
    			attr_dev(video_1, "id", "video");
    			attr_dev(video_1, "width", ctx.w);
    			attr_dev(video_1, "height", ctx.h);
    			video_1.autoplay = true;
    			video_1.playsInline = true;
    			video_1.muted = true;
    			attr_dev(video_1, "class", video_1_class_value = "" + null_to_empty((ctx.cameraOn ? '' : 'hidden')) + " svelte-92qeeg");
    			add_location(video_1, file, 133, 0, 2689);
    			attr_dev(canvas, "id", "video-capture-canvas");
    			attr_dev(canvas, "width", ctx.w);
    			attr_dev(canvas, "height", ctx.h);
    			attr_dev(canvas, "class", "svelte-92qeeg");
    			add_location(canvas, file, 134, 0, 2821);
    			attr_dev(div, "id", "video-overlay");
    			set_style(div, "width", "" + ctx.w + "px");
    			set_style(div, "height", "" + ctx.h + "px");
    			attr_dev(div, "class", "svelte-92qeeg");
    			add_location(div, file, 135, 0, 2916);
    			attr_dev(li0, "id", "retake-btn");
    			attr_dev(li0, "class", li0_class_value = "toolbar-btn " + (ctx.cameraOn ? 'hidden' : '') + " svelte-92qeeg");
    			add_location(li0, file, 138, 2, 3006);
    			attr_dev(li1, "id", "capture-btn");
    			attr_dev(li1, "class", li1_class_value = "toolbar-btn " + (ctx.cameraOn ? '' : 'hidden') + " svelte-92qeeg");
    			add_location(li1, file, 138, 100, 3104);
    			attr_dev(ul, "class", "toolbar svelte-92qeeg");
    			add_location(ul, file, 137, 0, 2983);

    			dispose = [
    				listen_dev(li0, "click", ctx.reshowCamera),
    				listen_dev(li1, "click", ctx.capture)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, video_1, anchor);
    			ctx.video_1_binding(video_1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, canvas, anchor);
    			ctx.canvas_binding(canvas);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(ul, li1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.w) {
    				attr_dev(video_1, "width", ctx.w);
    			}

    			if (changed.h) {
    				attr_dev(video_1, "height", ctx.h);
    			}

    			if ((changed.cameraOn) && video_1_class_value !== (video_1_class_value = "" + null_to_empty((ctx.cameraOn ? '' : 'hidden')) + " svelte-92qeeg")) {
    				attr_dev(video_1, "class", video_1_class_value);
    			}

    			if (changed.w) {
    				attr_dev(canvas, "width", ctx.w);
    			}

    			if (changed.h) {
    				attr_dev(canvas, "height", ctx.h);
    			}

    			if (changed.w) {
    				set_style(div, "width", "" + ctx.w + "px");
    			}

    			if (changed.h) {
    				set_style(div, "height", "" + ctx.h + "px");
    			}

    			if ((changed.cameraOn) && li0_class_value !== (li0_class_value = "toolbar-btn " + (ctx.cameraOn ? 'hidden' : '') + " svelte-92qeeg")) {
    				attr_dev(li0, "class", li0_class_value);
    			}

    			if ((changed.cameraOn) && li1_class_value !== (li1_class_value = "toolbar-btn " + (ctx.cameraOn ? '' : 'hidden') + " svelte-92qeeg")) {
    				attr_dev(li1, "class", li1_class_value);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(video_1);
    			}

    			ctx.video_1_binding(null);

    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(canvas);
    			}

    			ctx.canvas_binding(null);

    			if (detaching) {
    				detach_dev(t1);
    				detach_dev(div);
    				detach_dev(t2);
    				detach_dev(ul);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	

    let video;
    let captureCanvas;
    let h = window.innerHeight;
    let w;
    let localStream;
    let cameraOn = true;

    onMount (() => {
      // initCamera();
      // const context = captureCanvas.getContext('2d');
      // scaleCanvas(captureCanvas, context, w, h);
    });

    /* --------------------------------------------
     * TODO, set up cameraOn as a writable store value
     */
    function reshowCamera () {
      $$invalidate('cameraOn', cameraOn = true);
      clearOverlays();
    }

    function clearOverlays () {
      const context = captureCanvas.getContext('2d');
      context.clearRect(0, 0, w, h);
    }

    function capture () {
      $$invalidate('cameraOn', cameraOn = !cameraOn);
      const context = captureCanvas.getContext('2d');
      context.drawImage(video, 0, 0, w, h);
      showCamera = false;
    }

    	function video_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('video', video = $$value);
    		});
    	}

    	function canvas_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('captureCanvas', captureCanvas = $$value);
    		});
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('video' in $$props) $$invalidate('video', video = $$props.video);
    		if ('captureCanvas' in $$props) $$invalidate('captureCanvas', captureCanvas = $$props.captureCanvas);
    		if ('h' in $$props) $$invalidate('h', h = $$props.h);
    		if ('w' in $$props) $$invalidate('w', w = $$props.w);
    		if ('localStream' in $$props) localStream = $$props.localStream;
    		if ('cameraOn' in $$props) $$invalidate('cameraOn', cameraOn = $$props.cameraOn);
    	};

    	return {
    		video,
    		captureCanvas,
    		h,
    		w,
    		cameraOn,
    		reshowCamera,
    		capture,
    		video_1_binding,
    		canvas_binding
    	};
    }

    class Camera extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Camera", options, id: create_fragment.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    function create_fragment$1(ctx) {
    	var current;

    	var camera = new Camera({ $$inline: true });

    	const block = {
    		c: function create() {
    			camera.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(camera, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(camera.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(camera.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(camera, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$1.name });
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
