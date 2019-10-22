
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

    const globals = (typeof window !== 'undefined' ? window : global);
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

    /* src/components/Box.svelte generated by Svelte v3.12.1 */
    const { console: console_1 } = globals;

    const file = "src/components/Box.svelte";

    function create_fragment(ctx) {
    	var div, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "box svelte-1uepgxv");
    			set_style(div, "left", "" + ctx.box.bbox.x0 + "px");
    			set_style(div, "top", "" + ctx.box.bbox.y0 + "px");
    			set_style(div, "width", "" + (ctx.box.bbox.x1 - ctx.box.bbox.x0) + "px");
    			set_style(div, "height", "" + (ctx.box.bbox.y1 - ctx.box.bbox.y0) + "px");
    			add_location(div, file, 15, 0, 158);
    			dispose = listen_dev(div, "click", ctx.log);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.box) {
    				set_style(div, "left", "" + ctx.box.bbox.x0 + "px");
    				set_style(div, "top", "" + ctx.box.bbox.y0 + "px");
    				set_style(div, "width", "" + (ctx.box.bbox.x1 - ctx.box.bbox.x0) + "px");
    				set_style(div, "height", "" + (ctx.box.bbox.y1 - ctx.box.bbox.y0) + "px");
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

    function log () {
    	console.log(box.text);
    }

    	const writable_props = ['box'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<Box> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('box' in $$props) $$invalidate('box', box = $$props.box);
    	};

    	$$self.$capture_state = () => {
    		return { box };
    	};

    	$$self.$inject_state = $$props => {
    		if ('box' in $$props) $$invalidate('box', box = $$props.box);
    	};

    	return { box, log };
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["box"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Box", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.box === undefined && !('box' in props)) {
    			console_1.warn("<Box> was created without expected prop 'box'");
    		}
    	}

    	get box() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set box(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Camera.svelte generated by Svelte v3.12.1 */

    const file_1 = "src/components/Camera.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.box = list[i];
    	return child_ctx;
    }

    // (125:2) {#if boxes}
    function create_if_block(ctx) {
    	var each_1_anchor, current;

    	let each_value = ctx.boxes;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
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
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(125:2) {#if boxes}", ctx });
    	return block;
    }

    // (126:3) {#each boxes as box}
    function create_each_block(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(126:3) {#each boxes as box}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var div1, img, t0, div0, t1, div2, input, current, dispose;

    	var if_block = (ctx.boxes) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			div2 = element("div");
    			input = element("input");
    			attr_dev(img, "src", ctx.imageData);
    			attr_dev(img, "alt", "uploaded image");
    			attr_dev(img, "class", "svelte-16gi8qc");
    			add_location(img, file_1, 115, 1, 1999);
    			attr_dev(div0, "class", "image-overlay svelte-16gi8qc");
    			set_style(div0, "width", "" + ctx.width + "px");
    			set_style(div0, "height", "" + ctx.height + "px");
    			add_location(div0, file_1, 120, 1, 2074);
    			attr_dev(div1, "class", "image-container svelte-16gi8qc");
    			set_style(div1, "width", "" + ctx.width + "px");
    			set_style(div1, "height", "" + ctx.height + "px");
    			add_location(div1, file_1, 111, 0, 1922);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "capture", "camera");
    			attr_dev(input, "accept", "image/*");
    			attr_dev(input, "name", "cameraInput");
    			attr_dev(input, "class", "svelte-16gi8qc");
    			add_location(input, file_1, 133, 1, 2268);
    			attr_dev(div2, "class", "open-camera svelte-16gi8qc");
    			add_location(div2, file_1, 132, 0, 2241);
    			dispose = listen_dev(input, "change", ctx.input_change_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			ctx.img_binding(img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			if (if_block) if_block.m(div0, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, input);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.imageData) {
    				attr_dev(img, "src", ctx.imageData);
    			}

    			if (ctx.boxes) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}

    			if (!current || changed.width) {
    				set_style(div0, "width", "" + ctx.width + "px");
    			}

    			if (!current || changed.height) {
    				set_style(div0, "height", "" + ctx.height + "px");
    			}

    			if (!current || changed.width) {
    				set_style(div1, "width", "" + ctx.width + "px");
    			}

    			if (!current || changed.height) {
    				set_style(div1, "height", "" + ctx.height + "px");
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
    			if (detaching) {
    				detach_dev(div1);
    			}

    			ctx.img_binding(null);
    			if (if_block) if_block.d();

    			if (detaching) {
    				detach_dev(t1);
    				detach_dev(div2);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    const lang = 'fra';

    function instance$1($$self, $$props, $$invalidate) {
    	

    let image;
    let width;
    let height;
    let imageData;
    let boxes;

    const worker = window.Tesseract.createWorker({
    	logger: m => console.log(m)
    });

    async function init () {
    	await worker.load();
    	await worker.setParameters({
    		tessjs_create_box: 1
    	});
    	await worker.loadLanguage(lang);
    	await worker.initialize(lang);
    	console.log('done initializing');
    }

    init();

    const fileReader = new window.FileReader();
    $$invalidate('fileReader', fileReader.onload = function () {
    	$$invalidate('imageData', imageData = fileReader.result);
    	setTimeout(() => {
    		$$invalidate('width', width = image.width);
    		$$invalidate('height', height = image.height);
    		doOcr();
    	}, 1000);
    }, fileReader);

    function doOcr () {
    	(async () => {
    		console.log('recognizing');
    		const { data } = await worker.recognize(image);
    		console.log(data.text);
    		$$invalidate('boxes', boxes = data.words);
    		console.log('boxes', boxes);
    		// await worker.terminate();
    	})();
    }

    let files = [];

    	function img_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('image', image = $$value);
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
    		if ('files' in $$props) $$invalidate('files', files = $$props.files);
    		if ('file' in $$props) $$invalidate('file', file = $$props.file);
    	};

    	let file;

    	$$self.$$.update = ($$dirty = { files: 1, file: 1, fileReader: 1 }) => {
    		if ($$dirty.files) { $$invalidate('file', file = files[0]); }
    		if ($$dirty.file || $$dirty.fileReader) { if (file) fileReader.readAsDataURL(file); }
    	};

    	return {
    		image,
    		width,
    		height,
    		imageData,
    		boxes,
    		files,
    		img_binding,
    		input_change_handler
    	};
    }

    class Camera extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Camera", options, id: create_fragment$1.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    function create_fragment$2(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$2.name });
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
