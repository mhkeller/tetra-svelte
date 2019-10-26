
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
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
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const wordToTranslate = writable('');

    /* src/components/Box.svelte generated by Svelte v3.12.1 */

    const file = "src/components/Box.svelte";

    function create_fragment(ctx) {
    	var div, div_class_value, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "box " + (ctx.box.description === ctx.activeWord ? 'active' : '') + " svelte-14fm1i1");
    			set_style(div, "left", "" + ctx.box.boundingPoly.vertices[0].x + "px");
    			set_style(div, "top", "" + ctx.box.boundingPoly.vertices[0].y + "px");
    			set_style(div, "width", "" + (ctx.box.boundingPoly.vertices[1].x - ctx.box.boundingPoly.vertices[0].x) + "px");
    			set_style(div, "height", "" + (ctx.box.boundingPoly.vertices[2].y - ctx.box.boundingPoly.vertices[0].y) + "px");
    			add_location(div, file, 24, 0, 374);
    			dispose = listen_dev(div, "click", ctx.sendForTranslation);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.box || changed.activeWord) && div_class_value !== (div_class_value = "box " + (ctx.box.description === ctx.activeWord ? 'active' : '') + " svelte-14fm1i1")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (changed.box) {
    				set_style(div, "left", "" + ctx.box.boundingPoly.vertices[0].x + "px");
    				set_style(div, "top", "" + ctx.box.boundingPoly.vertices[0].y + "px");
    				set_style(div, "width", "" + (ctx.box.boundingPoly.vertices[1].x - ctx.box.boundingPoly.vertices[0].x) + "px");
    				set_style(div, "height", "" + (ctx.box.boundingPoly.vertices[2].y - ctx.box.boundingPoly.vertices[0].y) + "px");
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { box } = $$props;

    let activeWord;

    wordToTranslate.subscribe(val => {
    	$$invalidate('activeWord', activeWord = val);
    });
    function sendForTranslation () {
    	wordToTranslate.set(box.description);
    }

    	const writable_props = ['box'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Box> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('box' in $$props) $$invalidate('box', box = $$props.box);
    	};

    	$$self.$capture_state = () => {
    		return { box, activeWord };
    	};

    	$$self.$inject_state = $$props => {
    		if ('box' in $$props) $$invalidate('box', box = $$props.box);
    		if ('activeWord' in $$props) $$invalidate('activeWord', activeWord = $$props.activeWord);
    	};

    	return { box, activeWord, sendForTranslation };
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["box"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Box", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.box === undefined && !('box' in props)) {
    			console.warn("<Box> was created without expected prop 'box'");
    		}
    	}

    	get box() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set box(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TranslateDrawer.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/components/TranslateDrawer.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.translation = list[i];
    	return child_ctx;
    }

    // (87:0) {#if wtt}
    function create_if_block(ctx) {
    	var div2, input, t0, div0, t1, div1, dispose;

    	var if_block = (ctx.translations) && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			attr_dev(input, "type", "search");
    			input.value = ctx.wtt;
    			attr_dev(input, "class", "svelte-17m947x");
    			add_location(input, file$1, 90, 2, 1670);
    			attr_dev(div0, "class", "translated-text svelte-17m947x");
    			add_location(div0, file$1, 91, 2, 1709);
    			attr_dev(div1, "class", "close-btn svelte-17m947x");
    			add_location(div1, file$1, 100, 2, 1908);
    			attr_dev(div2, "class", "translate-drawer svelte-17m947x");
    			add_location(div2, file$1, 87, 1, 1633);
    			dispose = listen_dev(div1, "click", ctx.destroy);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, input);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.wtt) {
    				prop_dev(input, "value", ctx.wtt);
    			}

    			if (ctx.translations) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy_1(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			if (if_block) if_block.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(87:0) {#if wtt}", ctx });
    	return block;
    }

    // (95:3) {#if translations}
    function create_if_block_1(ctx) {
    	var each_1_anchor;

    	let each_value = ctx.translations;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.translations) {
    				each_value = ctx.translations;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy_1(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(95:3) {#if translations}", ctx });
    	return block;
    }

    // (96:4) {#each translations as translation}
    function create_each_block(ctx) {
    	var div, t_value = ctx.translation.translatedText + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "translated-word");
    			add_location(div, file$1, 96, 5, 1812);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.translations) && t_value !== (t_value = ctx.translation.translatedText + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		d: function destroy_1(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(96:4) {#each translations as translation}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor;

    	var if_block = (ctx.wtt) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.wtt) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy_1(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    const sourceLang = 'fr';

    const targetLang = 'en';

    function instance$1($$self, $$props, $$invalidate) {
    	let wtt;
    let translations;

    const key = window.localStorage.getItem('translate_key');
    console.log('key', key);
    wordToTranslate.subscribe(val => {
    	$$invalidate('wtt', wtt = val);
    	doTranslation(val);
    });

    async function doTranslation (val) {
    	const response = await window.fetch(`https://translation.googleapis.com/language/translate/v2?q=${val}&source=${sourceLang}&target=${targetLang}&key=${key}`, {
    		method: 'POST'
    	});
    	const res = await response.json();
    	console.log(res);
    	$$invalidate('translations', translations = res.data.translations);
    }

    function destroy () {
    	$$invalidate('wtt', wtt = null);
    }

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('wtt' in $$props) $$invalidate('wtt', wtt = $$props.wtt);
    		if ('translations' in $$props) $$invalidate('translations', translations = $$props.translations);
    	};

    	return { wtt, translations, destroy };
    }

    class TranslateDrawer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "TranslateDrawer", options, id: create_fragment$1.name });
    	}
    }

    /* src/components/Camera.svelte generated by Svelte v3.12.1 */

    const file_1 = "src/components/Camera.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.box = list[i];
    	return child_ctx;
    }

    // (224:1) {#if imageData}
    function create_if_block_3(ctx) {
    	var img, t, canvas_1, dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			canvas_1 = element("canvas");
    			attr_dev(img, "src", ctx.imageData);
    			attr_dev(img, "alt", "uploaded image");
    			attr_dev(img, "class", "svelte-19jdsu1");
    			add_location(img, file_1, 224, 2, 5053);
    			attr_dev(canvas_1, "class", "svelte-19jdsu1");
    			add_location(canvas_1, file_1, 230, 2, 5158);
    			dispose = listen_dev(img, "load", ctx.setDimensions);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			ctx.img_binding(img);
    			insert_dev(target, t, anchor);
    			insert_dev(target, canvas_1, anchor);
    			ctx.canvas_1_binding(canvas_1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.imageData) {
    				attr_dev(img, "src", ctx.imageData);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(img);
    			}

    			ctx.img_binding(null);

    			if (detaching) {
    				detach_dev(t);
    				detach_dev(canvas_1);
    			}

    			ctx.canvas_1_binding(null);
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(224:1) {#if imageData}", ctx });
    	return block;
    }

    // (236:2) {#if boxes}
    function create_if_block_1$1(ctx) {
    	var each_1_anchor, current;

    	let each_value = ctx.boxes;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.boxes) {
    				each_value = ctx.boxes;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(236:2) {#if boxes}", ctx });
    	return block;
    }

    // (238:4) {#if !box.locale}
    function create_if_block_2(ctx) {
    	var current;

    	var box = new Box({
    		props: { box: ctx.box },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			box.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var box_changes = {};
    			if (changed.boxes) box_changes.box = ctx.box;
    			box.$set(box_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(238:4) {#if !box.locale}", ctx });
    	return block;
    }

    // (237:3) {#each boxes as box}
    function create_each_block$1(ctx) {
    	var if_block_anchor, current;

    	var if_block = (!ctx.box.locale) && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!ctx.box.locale) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(237:3) {#each boxes as box}", ctx });
    	return block;
    }

    // (246:0) {#if wtt}
    function create_if_block$1(ctx) {
    	var current;

    	var translatedrawer = new TranslateDrawer({ $$inline: true });

    	const block = {
    		c: function create() {
    			translatedrawer.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(translatedrawer, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(translatedrawer.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(translatedrawer.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(translatedrawer, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(246:0) {#if wtt}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div1, t0, div0, t1, t2, div2, input, current, dispose;

    	var if_block0 = (ctx.imageData) && create_if_block_3(ctx);

    	var if_block1 = (ctx.boxes) && create_if_block_1$1(ctx);

    	var if_block2 = (ctx.wtt) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			div2 = element("div");
    			input = element("input");
    			attr_dev(div0, "class", "image-overlay svelte-19jdsu1");
    			add_location(div0, file_1, 232, 1, 5203);
    			attr_dev(div1, "class", "image-container svelte-19jdsu1");
    			set_style(div1, "width", "" + ctx.width + "px");
    			set_style(div1, "height", "" + ctx.height + "px");
    			add_location(div1, file_1, 219, 0, 4958);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "capture", "camera");
    			attr_dev(input, "accept", "image/*");
    			attr_dev(input, "name", "cameraInput");
    			attr_dev(input, "class", "svelte-19jdsu1");
    			add_location(input, file_1, 249, 1, 5422);
    			attr_dev(div2, "class", "open-camera svelte-19jdsu1");
    			add_location(div2, file_1, 248, 0, 5395);
    			dispose = listen_dev(input, "change", ctx.input_change_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, input);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.imageData) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(div1, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.boxes) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (!current || changed.width) {
    				set_style(div1, "width", "" + ctx.width + "px");
    			}

    			if (!current || changed.height) {
    				set_style(div1, "height", "" + ctx.height + "px");
    			}

    			if (ctx.wtt) {
    				if (!if_block2) {
    					if_block2 = create_if_block$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				} else transition_in(if_block2, 1);
    			} else if (if_block2) {
    				group_outros();
    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();

    			if (detaching) {
    				detach_dev(t1);
    			}

    			if (if_block2) if_block2.d(detaching);

    			if (detaching) {
    				detach_dev(t2);
    				detach_dev(div2);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    const lang = 'fr';

    function instance$2($$self, $$props, $$invalidate) {
    	

    let image;
    let width;
    let height;
    let imageData;
    let boxes;
    let wtt;
    let canvas;
    let srcOrientation;

    const ocrKey = window.localStorage.getItem('ocr_key');

    wordToTranslate.subscribe(val => {
    	$$invalidate('wtt', wtt = val);
    });

    const fileReader = new window.FileReader();
    const fileReaderBase64 = new window.FileReader();
    $$invalidate('fileReaderBase64', fileReaderBase64.onload = function () {
    	$$invalidate('imageData', imageData = fileReaderBase64.result);
    	console.log('loaded');
    }, fileReaderBase64);

    $$invalidate('fileReader', fileReader.onload = function (e) {
    	var view = new DataView(e.target.result);

    	if (view.getUint16(0, false) !== 0xFFD8) {
    		srcOrientation = -2;
    		return;
    	}

    	var length = view.byteLength;
    	var offset = 2;

    	while (offset < length) {
    		var marker = view.getUint16(offset, false);
    		offset += 2;

    		if (marker === 0xFFE1) {
    			if (view.getUint32(offset += 2, false) !== 0x45786966) {
    				srcOrientation = -1;
    				return;
    			}
    			var little = view.getUint16(offset += 6, false) === 0x4949;
    			offset += view.getUint32(offset + 4, little);
    			var tags = view.getUint16(offset, little);
    			offset += 2;

    			for (var i = 0; i < tags; i++) {
    				if (view.getUint16(offset + (i * 12), little) === 0x0112) {
    					srcOrientation = view.getUint16(offset + (i * 12) + 8, little);
    					return;
    				}
    			}
    		} else if ((marker & 0xFF00) !== 0xFF00) {
    			break;
    		} else {
    			offset += view.getUint16(offset, false);
    		}
    	}
    	srcOrientation = -1;
    }, fileReader);

    function doOcr () {
    	(async () => {
    		/* --------------------------------------------
    		 * Create a ghost canvas
    		 */
    		console.log('srcoriientation', srcOrientation);
    		const base64 = resetOrientation(imageData, width, height, srcOrientation).split(',')[1];
    		// const canvas = document.createElement('canvas');
    		// const ctx = canvas.getContext('2d');
    		// canvas.width = width;
    		// canvas.height = height;
    		// ctx.drawImage(image, 0, 0, width, height);
    		// const base64 = canvas.toDataURL().split(',')[1];

    		const response = await window.fetch(`https://vision.googleapis.com/v1/images:annotate?key=${ocrKey}`, {
    			method: 'POST',
    			body: JSON.stringify({
    				requests: [
    					{
    						image: {
    							content: base64
    						},
    						features: [
    							{
    								type: 'TEXT_DETECTION'
    							}
    						],
    						imageContext: {
    							languageHints: [lang]
    						}
    					}
    				]
    			})
    		});
    		const res = await response.json();

    		// const { data } = await worker.recognize(canvas);
    		console.log(res);
    		$$invalidate('boxes', boxes = res.responses[0].textAnnotations);
    		// await worker.terminate();
    	})();
    }

    function setDimensions () {
    	console.log('setting dimensions');
    	($$invalidate('width', { width, height } = this, width, $$invalidate('height', height)));
    	doOcr();
    }

    function resetOrientation (srcBase64, width, height, srcOrientation) {
    	// var canvas = document.createElement('canvas');
    	const ctx = canvas.getContext('2d');

    	// set proper canvas dimensions before transform & export
    	// scaleCanvas(canvas, ctx, width, height);
    	if (srcOrientation > 4 && srcOrientation < 9) {
    		$$invalidate('canvas', canvas.width = height, canvas);
    		$$invalidate('canvas', canvas.height = width, canvas);
    	} else {
    		$$invalidate('canvas', canvas.width = width, canvas);
    		$$invalidate('canvas', canvas.height = height, canvas);
    	}

    	// transform context before drawing image
    	switch (srcOrientation) {
    		case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
    		case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
    		case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
    		case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    		case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
    		case 7: ctx.transform(0, -1, -1, 0, height, width); break;
    		case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
    	}

    	// draw image
    	ctx.drawImage(image, 0, 0, width, height);

    	// export base64
    	// console.log(canvas.toDataURL());
    	return canvas.toDataURL();
    }

    let files = [];

    	function img_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('image', image = $$value);
    		});
    	}

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('canvas', canvas = $$value);
    		});
    	}

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate('files', files);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('image' in $$props) $$invalidate('image', image = $$props.image);
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    		if ('imageData' in $$props) $$invalidate('imageData', imageData = $$props.imageData);
    		if ('boxes' in $$props) $$invalidate('boxes', boxes = $$props.boxes);
    		if ('wtt' in $$props) $$invalidate('wtt', wtt = $$props.wtt);
    		if ('canvas' in $$props) $$invalidate('canvas', canvas = $$props.canvas);
    		if ('srcOrientation' in $$props) srcOrientation = $$props.srcOrientation;
    		if ('files' in $$props) $$invalidate('files', files = $$props.files);
    		if ('file' in $$props) $$invalidate('file', file = $$props.file);
    	};

    	let file;

    	$$self.$$.update = ($$dirty = { files: 1, file: 1, fileReader: 1, fileReaderBase64: 1 }) => {
    		if ($$dirty.files) { $$invalidate('file', file = files[0]); }
    		if ($$dirty.file || $$dirty.fileReader) { if (file) fileReader.readAsArrayBuffer(file.slice(0, 64 * 1024)); }
    		if ($$dirty.file || $$dirty.fileReaderBase64) { if (file) fileReaderBase64.readAsDataURL(file); }
    	};

    	return {
    		image,
    		width,
    		height,
    		imageData,
    		boxes,
    		wtt,
    		canvas,
    		setDimensions,
    		files,
    		img_binding,
    		canvas_1_binding,
    		input_change_handler
    	};
    }

    class Camera extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Camera", options, id: create_fragment$2.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    function create_fragment$3(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$3.name });
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
