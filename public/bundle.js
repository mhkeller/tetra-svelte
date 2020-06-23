
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
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
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

    const wordToTranslate = writable(null);

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
    			add_location(div, file, 25, 0, 375);
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

    // (96:0) {#if wtt !== null}
    function create_if_block(ctx) {
    	var div2, input_1, t0, div0, t1, div1, dispose;

    	var if_block = (ctx.translations) && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			input_1 = element("input");
    			t0 = space();
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");
    			attr_dev(input_1, "type", "search");
    			attr_dev(input_1, "class", "svelte-zyw1l0");
    			add_location(input_1, file$1, 99, 2, 1872);
    			attr_dev(div0, "class", "translated-text svelte-zyw1l0");
    			add_location(div0, file$1, 100, 2, 1969);
    			attr_dev(div1, "class", "close-btn svelte-zyw1l0");
    			add_location(div1, file$1, 109, 2, 2178);
    			attr_dev(div2, "class", "translate-drawer svelte-zyw1l0");
    			add_location(div2, file$1, 96, 1, 1835);

    			dispose = [
    				listen_dev(input_1, "input", ctx.input_handler),
    				listen_dev(div1, "click", ctx.destroy)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, input_1);
    			ctx.input_1_binding(input_1);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    		},

    		p: function update(changed, ctx) {
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

    			ctx.input_1_binding(null);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(96:0) {#if wtt !== null}", ctx });
    	return block;
    }

    // (104:3) {#if translations}
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
    			if (changed.sanitize || changed.translations) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(104:3) {#if translations}", ctx });
    	return block;
    }

    // (105:4) {#each translations as translation}
    function create_each_block(ctx) {
    	var div, t_value = sanitize(ctx.translation.translatedText) + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "translated-word");
    			add_location(div, file$1, 105, 5, 2072);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.translations) && t_value !== (t_value = sanitize(ctx.translation.translatedText) + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		d: function destroy_1(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(105:4) {#each translations as translation}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var if_block_anchor;

    	var if_block = (ctx.wtt !== null) && create_if_block(ctx);

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
    			if (ctx.wtt !== null) {
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

    function sanitize (val) {
    	return typeof val === 'string' ? val.replace(/(\.|!|\?|,)/g, '') : val;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

    	let wtt;
    	let translations;
    	let input;

    	let { translateKey, inputLanguage, outputLanguage } = $$props;

    	onMount(() => {
    		wordToTranslate.subscribe(val => {
    			if (document.activeElement !== input) {
    				if (input) {
    					$$invalidate('input', input.value = sanitize(val) || '', input);
    				}
    			}
    			$$invalidate('wtt', wtt = val);
    			doTranslation(val);
    		});
    	});

    	async function doTranslation (val) {
    		const response = await window.fetch(`https://translation.googleapis.com/language/translate/v2?q=${val}&source=${inputLanguage}&target=${outputLanguage}&key=${translateKey}`, {
    			method: 'POST'
    		});
    		const res = await response.json();
    		$$invalidate('translations', translations = res.data.translations);
    	}

    	function destroy () {
    		$$invalidate('input', input.value = null, input);
    		wordToTranslate.set(null);
    	}

    	const writable_props = ['translateKey', 'inputLanguage', 'outputLanguage'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<TranslateDrawer> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('input', input = $$value);
    		});
    	}

    	const input_handler = (e) => wordToTranslate.set(e.target.value);

    	$$self.$set = $$props => {
    		if ('translateKey' in $$props) $$invalidate('translateKey', translateKey = $$props.translateKey);
    		if ('inputLanguage' in $$props) $$invalidate('inputLanguage', inputLanguage = $$props.inputLanguage);
    		if ('outputLanguage' in $$props) $$invalidate('outputLanguage', outputLanguage = $$props.outputLanguage);
    	};

    	$$self.$capture_state = () => {
    		return { wtt, translations, input, translateKey, inputLanguage, outputLanguage };
    	};

    	$$self.$inject_state = $$props => {
    		if ('wtt' in $$props) $$invalidate('wtt', wtt = $$props.wtt);
    		if ('translations' in $$props) $$invalidate('translations', translations = $$props.translations);
    		if ('input' in $$props) $$invalidate('input', input = $$props.input);
    		if ('translateKey' in $$props) $$invalidate('translateKey', translateKey = $$props.translateKey);
    		if ('inputLanguage' in $$props) $$invalidate('inputLanguage', inputLanguage = $$props.inputLanguage);
    		if ('outputLanguage' in $$props) $$invalidate('outputLanguage', outputLanguage = $$props.outputLanguage);
    	};

    	return {
    		wtt,
    		translations,
    		input,
    		translateKey,
    		inputLanguage,
    		outputLanguage,
    		destroy,
    		input_1_binding,
    		input_handler
    	};
    }

    class TranslateDrawer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["translateKey", "inputLanguage", "outputLanguage"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "TranslateDrawer", options, id: create_fragment$1.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.translateKey === undefined && !('translateKey' in props)) {
    			console.warn("<TranslateDrawer> was created without expected prop 'translateKey'");
    		}
    		if (ctx.inputLanguage === undefined && !('inputLanguage' in props)) {
    			console.warn("<TranslateDrawer> was created without expected prop 'inputLanguage'");
    		}
    		if (ctx.outputLanguage === undefined && !('outputLanguage' in props)) {
    			console.warn("<TranslateDrawer> was created without expected prop 'outputLanguage'");
    		}
    	}

    	get translateKey() {
    		throw new Error("<TranslateDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set translateKey(value) {
    		throw new Error("<TranslateDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inputLanguage() {
    		throw new Error("<TranslateDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputLanguage(value) {
    		throw new Error("<TranslateDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outputLanguage() {
    		throw new Error("<TranslateDrawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outputLanguage(value) {
    		throw new Error("<TranslateDrawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Camera.svelte generated by Svelte v3.12.1 */
    const { console: console_1 } = globals;

    const file_1 = "src/components/Camera.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.box = list[i];
    	return child_ctx;
    }

    // (154:2) {#if boxes}
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(154:2) {#if boxes}", ctx });
    	return block;
    }

    // (156:4) {#if !box.locale}
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(156:4) {#if !box.locale}", ctx });
    	return block;
    }

    // (155:3) {#each boxes as box}
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(155:3) {#each boxes as box}", ctx });
    	return block;
    }

    // (164:0) {#if wtt !== null}
    function create_if_block$1(ctx) {
    	var current;

    	var translatedrawer = new TranslateDrawer({
    		props: {
    		inputLanguage: ctx.inputLanguage,
    		outputLanguage: ctx.outputLanguage,
    		translateKey: ctx.translateKey
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			translatedrawer.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(translatedrawer, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var translatedrawer_changes = {};
    			if (changed.inputLanguage) translatedrawer_changes.inputLanguage = ctx.inputLanguage;
    			if (changed.outputLanguage) translatedrawer_changes.outputLanguage = ctx.outputLanguage;
    			if (changed.translateKey) translatedrawer_changes.translateKey = ctx.translateKey;
    			translatedrawer.$set(translatedrawer_changes);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(164:0) {#if wtt !== null}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div2, div0, t0, div1, t1, t2, div3, input, current, dispose;

    	var if_block0 = (ctx.boxes) && create_if_block_1$1(ctx);

    	var if_block1 = (ctx.wtt !== null) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			div3 = element("div");
    			input = element("input");
    			add_location(div0, file_1, 149, 1, 2931);
    			attr_dev(div1, "class", "image-overlay svelte-1c254n7");
    			add_location(div1, file_1, 150, 1, 2972);
    			attr_dev(div2, "class", "image-container svelte-1c254n7");
    			set_style(div2, "width", "" + ctx.width + "px");
    			set_style(div2, "height", "" + ctx.height + "px");
    			toggle_class(div2, "wtt", ctx.wtt !== null);
    			add_location(div2, file_1, 143, 0, 2799);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "capture", "camera");
    			attr_dev(input, "accept", "image/*");
    			attr_dev(input, "name", "cameraInput");
    			attr_dev(input, "class", "svelte-1c254n7");
    			add_location(input, file_1, 171, 1, 3256);
    			attr_dev(div3, "class", "open-camera svelte-1c254n7");
    			add_location(div3, file_1, 170, 0, 3229);
    			dispose = listen_dev(input, "change", ctx.input_change_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			ctx.div0_binding(div0);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			if (if_block0) if_block0.m(div1, null);
    			ctx.div2_binding(div2);
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, input);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.boxes) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			if (!current || changed.width) {
    				set_style(div2, "width", "" + ctx.width + "px");
    			}

    			if (!current || changed.height) {
    				set_style(div2, "height", "" + ctx.height + "px");
    			}

    			if (changed.wtt) {
    				toggle_class(div2, "wtt", ctx.wtt !== null);
    			}

    			if (ctx.wtt !== null) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t2.parentNode, t2);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			ctx.div0_binding(null);
    			if (if_block0) if_block0.d();
    			ctx.div2_binding(null);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach_dev(t2);
    				detach_dev(div3);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	

    	let { inputLanguage, outputLanguage, ocrKey, translateKey } = $$props;

    	let width;
    	let height;
    	let boxes;
    	let wtt = null;
    	let imageContainer;
    	let canvasContainer;

    	wordToTranslate.subscribe(val => {
    		$$invalidate('wtt', wtt = val);
    	});

    	function imageLoaded (canvas) {
    		// This doesn't seem to clear the contents
    		$$invalidate('canvasContainer', canvasContainer.innerHTML = '', canvasContainer);
    		$$invalidate('boxes', boxes = null);
    		canvasContainer.appendChild(canvas);
    		// This doesn't asign values to `width` or `height`
    		$$invalidate('width', width = canvas.style.width.replace('px', ''));
    		$$invalidate('height', height = canvas.style.height.replace('px', ''));

    		const base64 = canvas.toDataURL().split(',')[1];
    		doOcr(base64);
    	}

    	function doOcr (base64) {
    		(async () => {
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
    								languageHints: [inputLanguage]
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

    	let files = [];
    	const options = {
    		maxWidth: window.innerWidth,
    		maxHeight: window.innerHeight * 0.92,
    		// pixelRatio: window.devicePixelRatio,
    		canvas: true,
    		// orientation: true,
    		cover: true
    	};

    	const writable_props = ['inputLanguage', 'outputLanguage', 'ocrKey', 'translateKey'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<Camera> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('canvasContainer', canvasContainer = $$value);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('imageContainer', imageContainer = $$value);
    		});
    	}

    	function input_change_handler() {
    		files = this.files;
    		$$invalidate('files', files);
    	}

    	$$self.$set = $$props => {
    		if ('inputLanguage' in $$props) $$invalidate('inputLanguage', inputLanguage = $$props.inputLanguage);
    		if ('outputLanguage' in $$props) $$invalidate('outputLanguage', outputLanguage = $$props.outputLanguage);
    		if ('ocrKey' in $$props) $$invalidate('ocrKey', ocrKey = $$props.ocrKey);
    		if ('translateKey' in $$props) $$invalidate('translateKey', translateKey = $$props.translateKey);
    	};

    	$$self.$capture_state = () => {
    		return { inputLanguage, outputLanguage, ocrKey, translateKey, width, height, boxes, wtt, imageContainer, canvasContainer, files, file };
    	};

    	$$self.$inject_state = $$props => {
    		if ('inputLanguage' in $$props) $$invalidate('inputLanguage', inputLanguage = $$props.inputLanguage);
    		if ('outputLanguage' in $$props) $$invalidate('outputLanguage', outputLanguage = $$props.outputLanguage);
    		if ('ocrKey' in $$props) $$invalidate('ocrKey', ocrKey = $$props.ocrKey);
    		if ('translateKey' in $$props) $$invalidate('translateKey', translateKey = $$props.translateKey);
    		if ('width' in $$props) $$invalidate('width', width = $$props.width);
    		if ('height' in $$props) $$invalidate('height', height = $$props.height);
    		if ('boxes' in $$props) $$invalidate('boxes', boxes = $$props.boxes);
    		if ('wtt' in $$props) $$invalidate('wtt', wtt = $$props.wtt);
    		if ('imageContainer' in $$props) $$invalidate('imageContainer', imageContainer = $$props.imageContainer);
    		if ('canvasContainer' in $$props) $$invalidate('canvasContainer', canvasContainer = $$props.canvasContainer);
    		if ('files' in $$props) $$invalidate('files', files = $$props.files);
    		if ('file' in $$props) $$invalidate('file', file = $$props.file);
    	};

    	let file;

    	$$self.$$.update = ($$dirty = { files: 1, file: 1 }) => {
    		if ($$dirty.files) { $$invalidate('file', file = files[0]); }
    		if ($$dirty.file) { if (file) window.loadImage(file, imageLoaded, options); }
    	};

    	return {
    		inputLanguage,
    		outputLanguage,
    		ocrKey,
    		translateKey,
    		width,
    		height,
    		boxes,
    		wtt,
    		imageContainer,
    		canvasContainer,
    		files,
    		div0_binding,
    		div2_binding,
    		input_change_handler
    	};
    }

    class Camera extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["inputLanguage", "outputLanguage", "ocrKey", "translateKey"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Camera", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.inputLanguage === undefined && !('inputLanguage' in props)) {
    			console_1.warn("<Camera> was created without expected prop 'inputLanguage'");
    		}
    		if (ctx.outputLanguage === undefined && !('outputLanguage' in props)) {
    			console_1.warn("<Camera> was created without expected prop 'outputLanguage'");
    		}
    		if (ctx.ocrKey === undefined && !('ocrKey' in props)) {
    			console_1.warn("<Camera> was created without expected prop 'ocrKey'");
    		}
    		if (ctx.translateKey === undefined && !('translateKey' in props)) {
    			console_1.warn("<Camera> was created without expected prop 'translateKey'");
    		}
    	}

    	get inputLanguage() {
    		throw new Error("<Camera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputLanguage(value) {
    		throw new Error("<Camera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outputLanguage() {
    		throw new Error("<Camera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outputLanguage(value) {
    		throw new Error("<Camera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ocrKey() {
    		throw new Error("<Camera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ocrKey(value) {
    		throw new Error("<Camera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get translateKey() {
    		throw new Error("<Camera>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set translateKey(value) {
    		throw new Error("<Camera>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Settings.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/components/Settings.svelte";

    function create_fragment$3(ctx) {
    	var div, button, t1, input0, t2, input1, t3, input2, t4, input3, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Close";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			input2 = element("input");
    			t4 = space();
    			input3 = element("input");
    			add_location(button, file$2, 18, 1, 277);
    			attr_dev(input0, "placeholder", "Input language...");
    			attr_dev(input0, "class", "svelte-1rh7wf5");
    			add_location(input0, file$2, 21, 1, 343);
    			attr_dev(input1, "placeholder", "Output language...");
    			attr_dev(input1, "class", "svelte-1rh7wf5");
    			add_location(input1, file$2, 25, 1, 418);
    			attr_dev(input2, "placeholder", "Enter OCR key...");
    			attr_dev(input2, "class", "svelte-1rh7wf5");
    			add_location(input2, file$2, 29, 1, 495);
    			attr_dev(input3, "placeholder", "Enter translation key...");
    			attr_dev(input3, "class", "svelte-1rh7wf5");
    			add_location(input3, file$2, 33, 1, 562);
    			attr_dev(div, "class", "input-container svelte-1rh7wf5");
    			add_location(div, file$2, 17, 0, 246);

    			dispose = [
    				listen_dev(button, "click", ctx.click_handler),
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(input1, "input", ctx.input1_input_handler),
    				listen_dev(input2, "input", ctx.input2_input_handler),
    				listen_dev(input3, "input", ctx.input3_input_handler)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			append_dev(div, input0);

    			set_input_value(input0, ctx.inputLanguage);

    			append_dev(div, t2);
    			append_dev(div, input1);

    			set_input_value(input1, ctx.outputLanguage);

    			append_dev(div, t3);
    			append_dev(div, input2);

    			set_input_value(input2, ctx.ocrKey);

    			append_dev(div, t4);
    			append_dev(div, input3);

    			set_input_value(input3, ctx.translateKey);
    		},

    		p: function update(changed, ctx) {
    			if (changed.inputLanguage && (input0.value !== ctx.inputLanguage)) set_input_value(input0, ctx.inputLanguage);
    			if (changed.outputLanguage && (input1.value !== ctx.outputLanguage)) set_input_value(input1, ctx.outputLanguage);
    			if (changed.ocrKey && (input2.value !== ctx.ocrKey)) set_input_value(input2, ctx.ocrKey);
    			if (changed.translateKey && (input3.value !== ctx.translateKey)) set_input_value(input3, ctx.translateKey);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { inputLanguage = 'fr', outputLanguage = 'en', ocrKey, translateKey, showSettings } = $$props;

    	const writable_props = ['inputLanguage', 'outputLanguage', 'ocrKey', 'translateKey', 'showSettings'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Settings> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate('showSettings', showSettings = false);

    	function input0_input_handler() {
    		inputLanguage = this.value;
    		$$invalidate('inputLanguage', inputLanguage);
    	}

    	function input1_input_handler() {
    		outputLanguage = this.value;
    		$$invalidate('outputLanguage', outputLanguage);
    	}

    	function input2_input_handler() {
    		ocrKey = this.value;
    		$$invalidate('ocrKey', ocrKey);
    	}

    	function input3_input_handler() {
    		translateKey = this.value;
    		$$invalidate('translateKey', translateKey);
    	}

    	$$self.$set = $$props => {
    		if ('inputLanguage' in $$props) $$invalidate('inputLanguage', inputLanguage = $$props.inputLanguage);
    		if ('outputLanguage' in $$props) $$invalidate('outputLanguage', outputLanguage = $$props.outputLanguage);
    		if ('ocrKey' in $$props) $$invalidate('ocrKey', ocrKey = $$props.ocrKey);
    		if ('translateKey' in $$props) $$invalidate('translateKey', translateKey = $$props.translateKey);
    		if ('showSettings' in $$props) $$invalidate('showSettings', showSettings = $$props.showSettings);
    	};

    	$$self.$capture_state = () => {
    		return { inputLanguage, outputLanguage, ocrKey, translateKey, showSettings };
    	};

    	$$self.$inject_state = $$props => {
    		if ('inputLanguage' in $$props) $$invalidate('inputLanguage', inputLanguage = $$props.inputLanguage);
    		if ('outputLanguage' in $$props) $$invalidate('outputLanguage', outputLanguage = $$props.outputLanguage);
    		if ('ocrKey' in $$props) $$invalidate('ocrKey', ocrKey = $$props.ocrKey);
    		if ('translateKey' in $$props) $$invalidate('translateKey', translateKey = $$props.translateKey);
    		if ('showSettings' in $$props) $$invalidate('showSettings', showSettings = $$props.showSettings);
    	};

    	return {
    		inputLanguage,
    		outputLanguage,
    		ocrKey,
    		translateKey,
    		showSettings,
    		click_handler,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler
    	};
    }

    class Settings extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["inputLanguage", "outputLanguage", "ocrKey", "translateKey", "showSettings"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Settings", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.ocrKey === undefined && !('ocrKey' in props)) {
    			console.warn("<Settings> was created without expected prop 'ocrKey'");
    		}
    		if (ctx.translateKey === undefined && !('translateKey' in props)) {
    			console.warn("<Settings> was created without expected prop 'translateKey'");
    		}
    		if (ctx.showSettings === undefined && !('showSettings' in props)) {
    			console.warn("<Settings> was created without expected prop 'showSettings'");
    		}
    	}

    	get inputLanguage() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputLanguage(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outputLanguage() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outputLanguage(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ocrKey() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ocrKey(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get translateKey() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set translateKey(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showSettings() {
    		throw new Error("<Settings>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showSettings(value) {
    		throw new Error("<Settings>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SettingsButton.svelte generated by Svelte v3.12.1 */

    const file$3 = "src/components/SettingsButton.svelte";

    function create_fragment$4(ctx) {
    	var div, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "show-settings svelte-1pudom9");
    			add_location(div, file$3, 18, 0, 282);
    			dispose = listen_dev(div, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { showSettings } = $$props;

    	const writable_props = ['showSettings'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SettingsButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate('showSettings', showSettings = true);

    	$$self.$set = $$props => {
    		if ('showSettings' in $$props) $$invalidate('showSettings', showSettings = $$props.showSettings);
    	};

    	$$self.$capture_state = () => {
    		return { showSettings };
    	};

    	$$self.$inject_state = $$props => {
    		if ('showSettings' in $$props) $$invalidate('showSettings', showSettings = $$props.showSettings);
    	};

    	return { showSettings, click_handler };
    }

    class SettingsButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["showSettings"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SettingsButton", options, id: create_fragment$4.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.showSettings === undefined && !('showSettings' in props)) {
    			console.warn("<SettingsButton> was created without expected prop 'showSettings'");
    		}
    	}

    	get showSettings() {
    		throw new Error("<SettingsButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showSettings(value) {
    		throw new Error("<SettingsButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    // (29:0) {:else}
    function create_else_block(ctx) {
    	var updating_showSettings, t, updating_showSettings_1, current;

    	function settingsbutton_showSettings_binding(value) {
    		ctx.settingsbutton_showSettings_binding.call(null, value);
    		updating_showSettings = true;
    		add_flush_callback(() => updating_showSettings = false);
    	}

    	let settingsbutton_props = {};
    	if (ctx.showSettings !== void 0) {
    		settingsbutton_props.showSettings = ctx.showSettings;
    	}
    	var settingsbutton = new SettingsButton({
    		props: settingsbutton_props,
    		$$inline: true
    	});

    	binding_callbacks.push(() => bind(settingsbutton, 'showSettings', settingsbutton_showSettings_binding));

    	function camera_showSettings_binding(value_1) {
    		ctx.camera_showSettings_binding.call(null, value_1);
    		updating_showSettings_1 = true;
    		add_flush_callback(() => updating_showSettings_1 = false);
    	}

    	let camera_props = {
    		inputLanguage: ctx.inputLanguage,
    		outputLanguage: ctx.outputLanguage,
    		ocrKey: ctx.ocrKey,
    		translateKey: ctx.translateKey
    	};
    	if (ctx.showSettings !== void 0) {
    		camera_props.showSettings = ctx.showSettings;
    	}
    	var camera = new Camera({ props: camera_props, $$inline: true });

    	binding_callbacks.push(() => bind(camera, 'showSettings', camera_showSettings_binding));

    	const block = {
    		c: function create() {
    			settingsbutton.$$.fragment.c();
    			t = space();
    			camera.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(settingsbutton, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(camera, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var settingsbutton_changes = {};
    			if (!updating_showSettings && changed.showSettings) {
    				settingsbutton_changes.showSettings = ctx.showSettings;
    			}
    			settingsbutton.$set(settingsbutton_changes);

    			var camera_changes = {};
    			if (changed.inputLanguage) camera_changes.inputLanguage = ctx.inputLanguage;
    			if (changed.outputLanguage) camera_changes.outputLanguage = ctx.outputLanguage;
    			if (changed.ocrKey) camera_changes.ocrKey = ctx.ocrKey;
    			if (changed.translateKey) camera_changes.translateKey = ctx.translateKey;
    			if (!updating_showSettings_1 && changed.showSettings) {
    				camera_changes.showSettings = ctx.showSettings;
    			}
    			camera.$set(camera_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(settingsbutton.$$.fragment, local);

    			transition_in(camera.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(settingsbutton.$$.fragment, local);
    			transition_out(camera.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(settingsbutton, detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			destroy_component(camera, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(29:0) {:else}", ctx });
    	return block;
    }

    // (21:0) {#if showSettings}
    function create_if_block$2(ctx) {
    	var updating_inputLanguage, updating_outputLanguage, updating_ocrKey, updating_translateKey, updating_showSettings, current;

    	function settings_inputLanguage_binding(value) {
    		ctx.settings_inputLanguage_binding.call(null, value);
    		updating_inputLanguage = true;
    		add_flush_callback(() => updating_inputLanguage = false);
    	}

    	function settings_outputLanguage_binding(value_1) {
    		ctx.settings_outputLanguage_binding.call(null, value_1);
    		updating_outputLanguage = true;
    		add_flush_callback(() => updating_outputLanguage = false);
    	}

    	function settings_ocrKey_binding(value_2) {
    		ctx.settings_ocrKey_binding.call(null, value_2);
    		updating_ocrKey = true;
    		add_flush_callback(() => updating_ocrKey = false);
    	}

    	function settings_translateKey_binding(value_3) {
    		ctx.settings_translateKey_binding.call(null, value_3);
    		updating_translateKey = true;
    		add_flush_callback(() => updating_translateKey = false);
    	}

    	function settings_showSettings_binding(value_4) {
    		ctx.settings_showSettings_binding.call(null, value_4);
    		updating_showSettings = true;
    		add_flush_callback(() => updating_showSettings = false);
    	}

    	let settings_props = {};
    	if (ctx.inputLanguage !== void 0) {
    		settings_props.inputLanguage = ctx.inputLanguage;
    	}
    	if (ctx.outputLanguage !== void 0) {
    		settings_props.outputLanguage = ctx.outputLanguage;
    	}
    	if (ctx.ocrKey !== void 0) {
    		settings_props.ocrKey = ctx.ocrKey;
    	}
    	if (ctx.translateKey !== void 0) {
    		settings_props.translateKey = ctx.translateKey;
    	}
    	if (ctx.showSettings !== void 0) {
    		settings_props.showSettings = ctx.showSettings;
    	}
    	var settings = new Settings({ props: settings_props, $$inline: true });

    	binding_callbacks.push(() => bind(settings, 'inputLanguage', settings_inputLanguage_binding));
    	binding_callbacks.push(() => bind(settings, 'outputLanguage', settings_outputLanguage_binding));
    	binding_callbacks.push(() => bind(settings, 'ocrKey', settings_ocrKey_binding));
    	binding_callbacks.push(() => bind(settings, 'translateKey', settings_translateKey_binding));
    	binding_callbacks.push(() => bind(settings, 'showSettings', settings_showSettings_binding));

    	const block = {
    		c: function create() {
    			settings.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(settings, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var settings_changes = {};
    			if (!updating_inputLanguage && changed.inputLanguage) {
    				settings_changes.inputLanguage = ctx.inputLanguage;
    			}
    			if (!updating_outputLanguage && changed.outputLanguage) {
    				settings_changes.outputLanguage = ctx.outputLanguage;
    			}
    			if (!updating_ocrKey && changed.ocrKey) {
    				settings_changes.ocrKey = ctx.ocrKey;
    			}
    			if (!updating_translateKey && changed.translateKey) {
    				settings_changes.translateKey = ctx.translateKey;
    			}
    			if (!updating_showSettings && changed.showSettings) {
    				settings_changes.showSettings = ctx.showSettings;
    			}
    			settings.$set(settings_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(settings.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(settings.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(settings, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(21:0) {#if showSettings}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block$2,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.showSettings) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	

    	let inputLanguage = 'fr';
    	let outputLanguage = 'en';

    	let ocrKey = window.localStorage.getItem('ocr_key');
    	let translateKey = window.localStorage.getItem('translate_key');

    	let showSettings = !ocrKey || !translateKey;

    	function settings_inputLanguage_binding(value) {
    		inputLanguage = value;
    		$$invalidate('inputLanguage', inputLanguage);
    	}

    	function settings_outputLanguage_binding(value_1) {
    		outputLanguage = value_1;
    		$$invalidate('outputLanguage', outputLanguage);
    	}

    	function settings_ocrKey_binding(value_2) {
    		ocrKey = value_2;
    		$$invalidate('ocrKey', ocrKey);
    	}

    	function settings_translateKey_binding(value_3) {
    		translateKey = value_3;
    		$$invalidate('translateKey', translateKey);
    	}

    	function settings_showSettings_binding(value_4) {
    		showSettings = value_4;
    		$$invalidate('showSettings', showSettings);
    	}

    	function settingsbutton_showSettings_binding(value) {
    		showSettings = value;
    		$$invalidate('showSettings', showSettings);
    	}

    	function camera_showSettings_binding(value_1) {
    		showSettings = value_1;
    		$$invalidate('showSettings', showSettings);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('inputLanguage' in $$props) $$invalidate('inputLanguage', inputLanguage = $$props.inputLanguage);
    		if ('outputLanguage' in $$props) $$invalidate('outputLanguage', outputLanguage = $$props.outputLanguage);
    		if ('ocrKey' in $$props) $$invalidate('ocrKey', ocrKey = $$props.ocrKey);
    		if ('translateKey' in $$props) $$invalidate('translateKey', translateKey = $$props.translateKey);
    		if ('showSettings' in $$props) $$invalidate('showSettings', showSettings = $$props.showSettings);
    	};

    	return {
    		inputLanguage,
    		outputLanguage,
    		ocrKey,
    		translateKey,
    		showSettings,
    		settings_inputLanguage_binding,
    		settings_outputLanguage_binding,
    		settings_ocrKey_binding,
    		settings_translateKey_binding,
    		settings_showSettings_binding,
    		settingsbutton_showSettings_binding,
    		camera_showSettings_binding
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$5.name });
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
