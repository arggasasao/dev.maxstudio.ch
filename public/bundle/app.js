
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
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
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Slider.svelte generated by Svelte v3.42.3 */

    const file$a = "src/components/Slider.svelte";

    function create_fragment$b(ctx) {
    	let section;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div1;
    	let h1;
    	let t2;
    	let h2;
    	let t4;
    	let p;
    	let t6;
    	let button;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Working summerX";
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "Taste the eficiency";
    			t4 = space();
    			p = element("p");
    			p.textContent = "Aqui pode ver algumas de nossas especialidades.\n                Si não encontrou o que procura, consultar-nos sem compromiso nenhum.";
    			t6 = space();
    			button = element("button");
    			button.textContent = "Hire us";
    			attr_dev(img, "srcset", "img/slide_01@2x.png");
    			if (!src_url_equal(img.src, img_src_value = "img/slide_01.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$a, 6, 8, 86);
    			attr_dev(div0, "class", "slider__image");
    			add_location(div0, file$a, 5, 4, 50);
    			add_location(h1, file$a, 10, 12, 245);
    			add_location(h2, file$a, 11, 12, 282);
    			add_location(p, file$a, 12, 12, 323);
    			add_location(button, file$a, 14, 16, 479);
    			attr_dev(div1, "class", "slider__title");
    			add_location(div1, file$a, 9, 8, 205);
    			attr_dev(div2, "class", "slider__textbox");
    			add_location(div2, file$a, 8, 4, 167);
    			attr_dev(section, "class", "slider");
    			add_location(section, file$a, 4, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, img);
    			append_dev(section, t0);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, h2);
    			append_dev(div1, t4);
    			append_dev(div1, p);
    			append_dev(div1, t6);
    			append_dev(div1, button);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Slider', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Slider> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Slider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Slider",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/Services.svelte generated by Svelte v3.42.3 */

    const file$9 = "src/components/Services.svelte";

    function create_fragment$a(ctx) {
    	let section0;
    	let div1;
    	let h10;
    	let t1;
    	let h20;
    	let t3;
    	let p0;
    	let t5;
    	let div0;
    	let span0;
    	let t7;
    	let img0;
    	let img0_src_value;
    	let t8;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t9;
    	let section1;
    	let div4;
    	let h11;
    	let t11;
    	let h21;
    	let t13;
    	let p1;
    	let t15;
    	let div3;
    	let span1;
    	let t17;
    	let img2;
    	let img2_src_value;
    	let t18;
    	let div5;
    	let img3;
    	let img3_src_value;
    	let t19;
    	let section2;
    	let div7;
    	let h12;
    	let t21;
    	let h22;
    	let t23;
    	let p2;
    	let t25;
    	let div6;
    	let span2;
    	let t27;
    	let img4;
    	let img4_src_value;
    	let t28;
    	let div8;
    	let img5;
    	let img5_src_value;
    	let t29;
    	let section3;
    	let div10;
    	let h13;
    	let t31;
    	let h23;
    	let t33;
    	let p3;
    	let t35;
    	let div9;
    	let span3;
    	let t37;
    	let img6;
    	let img6_src_value;
    	let t38;
    	let div11;
    	let img7;
    	let img7_src_value;
    	let t39;
    	let section4;
    	let div13;
    	let h14;
    	let t41;
    	let h24;
    	let t43;
    	let p4;
    	let t45;
    	let div12;
    	let span4;
    	let t47;
    	let img8;
    	let img8_src_value;
    	let t48;
    	let div14;
    	let img9;
    	let img9_src_value;

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div1 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Branding";
    			t1 = space();
    			h20 = element("h2");
    			h20.textContent = "Business";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "Sit ea eiusmod commodo aliqua eiusmod labore eu deserunt pariatur\n            magna. Eiusmod aute eiusmod id elit mollit eiusmod magna eu mollit\n            ullamco excepteur elit. Reprehenderit ullamco proident reprehenderit\n            labore. Occaecat consectetur nisi culpa ullamco aliquip ex aliquip.\n            Tempor ad dolor deserunt veniam ex est consectetur officia commodo.";
    			t5 = space();
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "see more";
    			t7 = space();
    			img0 = element("img");
    			t8 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t9 = space();
    			section1 = element("section");
    			div4 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Website";
    			t11 = space();
    			h21 = element("h2");
    			h21.textContent = "Institucional";
    			t13 = space();
    			p1 = element("p");
    			p1.textContent = "Sit ea eiusmod commodo aliqua eiusmod labore eu deserunt pariatur\n            magna. Eiusmod aute eiusmod id elit mollit eiusmod magna eu mollit\n            ullamco excepteur elit. Reprehenderit ullamco proident reprehenderit\n            labore. Occaecat consectetur nisi culpa ullamco aliquip ex aliquip.\n            Tempor ad dolor deserunt veniam ex est consectetur officia commodo.";
    			t15 = space();
    			div3 = element("div");
    			span1 = element("span");
    			span1.textContent = "see more";
    			t17 = space();
    			img2 = element("img");
    			t18 = space();
    			div5 = element("div");
    			img3 = element("img");
    			t19 = space();
    			section2 = element("section");
    			div7 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Social Media";
    			t21 = space();
    			h22 = element("h2");
    			h22.textContent = "Focus your target";
    			t23 = space();
    			p2 = element("p");
    			p2.textContent = "Sit ea eiusmod commodo aliqua eiusmod labore eu deserunt pariatur\n            magna. Eiusmod aute eiusmod id elit mollit eiusmod magna eu mollit\n            ullamco excepteur elit. Reprehenderit ullamco proident reprehenderit\n            labore. Occaecat consectetur nisi culpa ullamco aliquip ex aliquip.\n            Tempor ad dolor deserunt veniam ex est consectetur officia commodo.";
    			t25 = space();
    			div6 = element("div");
    			span2 = element("span");
    			span2.textContent = "see more";
    			t27 = space();
    			img4 = element("img");
    			t28 = space();
    			div8 = element("div");
    			img5 = element("img");
    			t29 = space();
    			section3 = element("section");
    			div10 = element("div");
    			h13 = element("h1");
    			h13.textContent = "E-Commerce";
    			t31 = space();
    			h23 = element("h2");
    			h23.textContent = "Impruve sales";
    			t33 = space();
    			p3 = element("p");
    			p3.textContent = "Sit ea eiusmod commodo aliqua eiusmod labore eu deserunt pariatur\n            magna. Eiusmod aute eiusmod id elit mollit eiusmod magna eu mollit\n            ullamco excepteur elit. Reprehenderit ullamco proident reprehenderit\n            labore. Occaecat consectetur nisi culpa ullamco aliquip ex aliquip.\n            Tempor ad dolor deserunt veniam ex est consectetur officia commodo.";
    			t35 = space();
    			div9 = element("div");
    			span3 = element("span");
    			span3.textContent = "see more";
    			t37 = space();
    			img6 = element("img");
    			t38 = space();
    			div11 = element("div");
    			img7 = element("img");
    			t39 = space();
    			section4 = element("section");
    			div13 = element("div");
    			h14 = element("h1");
    			h14.textContent = "E-Commerce";
    			t41 = space();
    			h24 = element("h2");
    			h24.textContent = "Impruve sales";
    			t43 = space();
    			p4 = element("p");
    			p4.textContent = "Sit ea eiusmod commodo aliqua eiusmod labore eu deserunt pariatur\n            magna. Eiusmod aute eiusmod id elit mollit eiusmod magna eu mollit\n            ullamco excepteur elit. Reprehenderit ullamco proident reprehenderit\n            labore. Occaecat consectetur nisi culpa ullamco aliquip ex aliquip.\n            Tempor ad dolor deserunt veniam ex est consectetur officia commodo.";
    			t45 = space();
    			div12 = element("div");
    			span4 = element("span");
    			span4.textContent = "see more";
    			t47 = space();
    			img8 = element("img");
    			t48 = space();
    			div14 = element("div");
    			img9 = element("img");
    			add_location(h10, file$9, 5, 8, 89);
    			add_location(h20, file$9, 6, 8, 115);
    			add_location(p0, file$9, 7, 8, 141);
    			add_location(span0, file$9, 15, 12, 607);
    			if (!src_url_equal(img0.src, img0_src_value = "./img/arrow-seemore.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "srcset", "");
    			add_location(img0, file$9, 16, 12, 641);
    			attr_dev(div0, "class", "service__seemore");
    			add_location(div0, file$9, 14, 8, 564);
    			attr_dev(div1, "class", "service__textbox");
    			add_location(div1, file$9, 4, 4, 50);
    			if (!src_url_equal(img1.src, img1_src_value = "img/brand_01.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "srcset", "img/brand_01@2x.png");
    			add_location(img1, file$9, 20, 8, 763);
    			attr_dev(div2, "class", "service__image");
    			add_location(div2, file$9, 19, 4, 726);
    			attr_dev(section0, "class", "service");
    			add_location(section0, file$9, 3, 0, 20);
    			add_location(h11, file$9, 26, 8, 937);
    			add_location(h21, file$9, 27, 8, 962);
    			add_location(p1, file$9, 28, 8, 993);
    			add_location(span1, file$9, 36, 12, 1459);
    			if (!src_url_equal(img2.src, img2_src_value = "./img/arrow-seemore.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "srcset", "");
    			add_location(img2, file$9, 37, 12, 1493);
    			attr_dev(div3, "class", "service__seemore");
    			add_location(div3, file$9, 35, 8, 1416);
    			attr_dev(div4, "class", "service__textbox");
    			add_location(div4, file$9, 25, 4, 898);
    			if (!src_url_equal(img3.src, img3_src_value = "img/web_developer.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			attr_dev(img3, "srcset", "");
    			add_location(img3, file$9, 41, 8, 1615);
    			attr_dev(div5, "class", "service__image");
    			add_location(div5, file$9, 40, 4, 1578);
    			attr_dev(section1, "class", "service service__right");
    			add_location(section1, file$9, 24, 0, 853);
    			add_location(h12, file$9, 47, 8, 1760);
    			add_location(h22, file$9, 48, 8, 1790);
    			add_location(p2, file$9, 49, 8, 1825);
    			add_location(span2, file$9, 57, 12, 2291);
    			if (!src_url_equal(img4.src, img4_src_value = "./img/arrow-seemore.svg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			attr_dev(img4, "srcset", "");
    			add_location(img4, file$9, 58, 12, 2325);
    			attr_dev(div6, "class", "service__seemore");
    			add_location(div6, file$9, 56, 8, 2248);
    			attr_dev(div7, "class", "service__textbox");
    			add_location(div7, file$9, 46, 4, 1721);
    			if (!src_url_equal(img5.src, img5_src_value = "img/brand_01.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "");
    			attr_dev(img5, "srcset", "");
    			add_location(img5, file$9, 62, 8, 2447);
    			attr_dev(div8, "class", "service__image");
    			add_location(div8, file$9, 61, 4, 2410);
    			attr_dev(section2, "class", "service");
    			add_location(section2, file$9, 45, 0, 1691);
    			add_location(h13, file$9, 68, 8, 2602);
    			add_location(h23, file$9, 69, 8, 2630);
    			add_location(p3, file$9, 70, 8, 2661);
    			add_location(span3, file$9, 78, 12, 3127);
    			if (!src_url_equal(img6.src, img6_src_value = "./img/arrow-seemore.svg")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "");
    			attr_dev(img6, "srcset", "");
    			add_location(img6, file$9, 79, 12, 3161);
    			attr_dev(div9, "class", "service__seemore");
    			add_location(div9, file$9, 77, 8, 3084);
    			attr_dev(div10, "class", "service__textbox");
    			add_location(div10, file$9, 67, 4, 2563);
    			if (!src_url_equal(img7.src, img7_src_value = "img/brand_01.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "");
    			attr_dev(img7, "srcset", "");
    			add_location(img7, file$9, 83, 8, 3283);
    			attr_dev(div11, "class", "service__image");
    			add_location(div11, file$9, 82, 4, 3246);
    			attr_dev(section3, "class", "service service__right");
    			add_location(section3, file$9, 66, 0, 2518);
    			add_location(h14, file$9, 88, 8, 3422);
    			add_location(h24, file$9, 89, 8, 3450);
    			add_location(p4, file$9, 90, 8, 3481);
    			add_location(span4, file$9, 98, 12, 3947);
    			if (!src_url_equal(img8.src, img8_src_value = "./img/arrow-seemore.svg")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "");
    			attr_dev(img8, "srcset", "");
    			add_location(img8, file$9, 99, 12, 3981);
    			attr_dev(div12, "class", "service__seemore");
    			add_location(div12, file$9, 97, 8, 3904);
    			attr_dev(div13, "class", "service__textbox");
    			add_location(div13, file$9, 87, 4, 3383);
    			if (!src_url_equal(img9.src, img9_src_value = "img/brand_01.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "");
    			attr_dev(img9, "srcset", "");
    			add_location(img9, file$9, 103, 8, 4103);
    			attr_dev(div14, "class", "service__image");
    			add_location(div14, file$9, 102, 4, 4066);
    			attr_dev(section4, "class", "service");
    			add_location(section4, file$9, 86, 0, 3353);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div1);
    			append_dev(div1, h10);
    			append_dev(div1, t1);
    			append_dev(div1, h20);
    			append_dev(div1, t3);
    			append_dev(div1, p0);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t7);
    			append_dev(div0, img0);
    			append_dev(section0, t8);
    			append_dev(section0, div2);
    			append_dev(div2, img1);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div4);
    			append_dev(div4, h11);
    			append_dev(div4, t11);
    			append_dev(div4, h21);
    			append_dev(div4, t13);
    			append_dev(div4, p1);
    			append_dev(div4, t15);
    			append_dev(div4, div3);
    			append_dev(div3, span1);
    			append_dev(div3, t17);
    			append_dev(div3, img2);
    			append_dev(section1, t18);
    			append_dev(section1, div5);
    			append_dev(div5, img3);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div7);
    			append_dev(div7, h12);
    			append_dev(div7, t21);
    			append_dev(div7, h22);
    			append_dev(div7, t23);
    			append_dev(div7, p2);
    			append_dev(div7, t25);
    			append_dev(div7, div6);
    			append_dev(div6, span2);
    			append_dev(div6, t27);
    			append_dev(div6, img4);
    			append_dev(section2, t28);
    			append_dev(section2, div8);
    			append_dev(div8, img5);
    			insert_dev(target, t29, anchor);
    			insert_dev(target, section3, anchor);
    			append_dev(section3, div10);
    			append_dev(div10, h13);
    			append_dev(div10, t31);
    			append_dev(div10, h23);
    			append_dev(div10, t33);
    			append_dev(div10, p3);
    			append_dev(div10, t35);
    			append_dev(div10, div9);
    			append_dev(div9, span3);
    			append_dev(div9, t37);
    			append_dev(div9, img6);
    			append_dev(section3, t38);
    			append_dev(section3, div11);
    			append_dev(div11, img7);
    			insert_dev(target, t39, anchor);
    			insert_dev(target, section4, anchor);
    			append_dev(section4, div13);
    			append_dev(div13, h14);
    			append_dev(div13, t41);
    			append_dev(div13, h24);
    			append_dev(div13, t43);
    			append_dev(div13, p4);
    			append_dev(div13, t45);
    			append_dev(div13, div12);
    			append_dev(div12, span4);
    			append_dev(div12, t47);
    			append_dev(div12, img8);
    			append_dev(section4, t48);
    			append_dev(section4, div14);
    			append_dev(div14, img9);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(section2);
    			if (detaching) detach_dev(t29);
    			if (detaching) detach_dev(section3);
    			if (detaching) detach_dev(t39);
    			if (detaching) detach_dev(section4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Services', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Services> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Services extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Services",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* node_modules/svelte-awesome/components/svg/Path.svelte generated by Svelte v3.42.3 */

    const file$8 = "node_modules/svelte-awesome/components/svg/Path.svelte";

    function create_fragment$9(ctx) {
    	let path;
    	let path_key_value;

    	let path_levels = [
    		{
    			key: path_key_value = "path-" + /*id*/ ctx[0]
    		},
    		/*data*/ ctx[1]
    	];

    	let path_data = {};

    	for (let i = 0; i < path_levels.length; i += 1) {
    		path_data = assign(path_data, path_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			set_svg_attributes(path, path_data);
    			add_location(path, file$8, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(path, path_data = get_spread_update(path_levels, [
    				dirty & /*id*/ 1 && path_key_value !== (path_key_value = "path-" + /*id*/ ctx[0]) && { key: path_key_value },
    				dirty & /*data*/ 2 && /*data*/ ctx[1]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Path', slots, []);
    	let { id = '' } = $$props;
    	let { data = {} } = $$props;
    	const writable_props = ['id', 'data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Path> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ id, data });

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, data];
    }

    class Path extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { id: 0, data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Path",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get id() {
    		throw new Error("<Path>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Path>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Path>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Path>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome/components/svg/Polygon.svelte generated by Svelte v3.42.3 */

    const file$7 = "node_modules/svelte-awesome/components/svg/Polygon.svelte";

    function create_fragment$8(ctx) {
    	let polygon;
    	let polygon_key_value;

    	let polygon_levels = [
    		{
    			key: polygon_key_value = "polygon-" + /*id*/ ctx[0]
    		},
    		/*data*/ ctx[1]
    	];

    	let polygon_data = {};

    	for (let i = 0; i < polygon_levels.length; i += 1) {
    		polygon_data = assign(polygon_data, polygon_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			polygon = svg_element("polygon");
    			set_svg_attributes(polygon, polygon_data);
    			add_location(polygon, file$7, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, polygon, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			set_svg_attributes(polygon, polygon_data = get_spread_update(polygon_levels, [
    				dirty & /*id*/ 1 && polygon_key_value !== (polygon_key_value = "polygon-" + /*id*/ ctx[0]) && { key: polygon_key_value },
    				dirty & /*data*/ 2 && /*data*/ ctx[1]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(polygon);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Polygon', slots, []);
    	let { id = '' } = $$props;
    	let { data = {} } = $$props;
    	const writable_props = ['id', 'data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Polygon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ id, data });

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, data];
    }

    class Polygon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { id: 0, data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Polygon",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get id() {
    		throw new Error("<Polygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Polygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Polygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Polygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome/components/svg/Raw.svelte generated by Svelte v3.42.3 */

    const file$6 = "node_modules/svelte-awesome/components/svg/Raw.svelte";

    function create_fragment$7(ctx) {
    	let g;

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			add_location(g, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			g.innerHTML = /*raw*/ ctx[0];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*raw*/ 1) g.innerHTML = /*raw*/ ctx[0];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Raw', slots, []);
    	let cursor = 0xd4937;

    	function getId() {
    		cursor += 1;
    		return `fa-${cursor.toString(16)}`;
    	}

    	let raw;
    	let { data } = $$props;

    	function getRaw(data) {
    		if (!data || !data.raw) {
    			return null;
    		}

    		let rawData = data.raw;
    		const ids = {};

    		rawData = rawData.replace(/\s(?:xml:)?id=["']?([^"')\s]+)/g, (match, id) => {
    			const uniqueId = getId();
    			ids[id] = uniqueId;
    			return ` id="${uniqueId}"`;
    		});

    		rawData = rawData.replace(/#(?:([^'")\s]+)|xpointer\(id\((['"]?)([^')]+)\2\)\))/g, (match, rawId, _, pointerId) => {
    			const id = rawId || pointerId;

    			if (!id || !ids[id]) {
    				return match;
    			}

    			return `#${ids[id]}`;
    		});

    		return rawData;
    	}

    	const writable_props = ['data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Raw> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ cursor, getId, raw, data, getRaw });

    	$$self.$inject_state = $$props => {
    		if ('cursor' in $$props) cursor = $$props.cursor;
    		if ('raw' in $$props) $$invalidate(0, raw = $$props.raw);
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 2) {
    			$$invalidate(0, raw = getRaw(data));
    		}
    	};

    	return [raw, data];
    }

    class Raw extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { data: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Raw",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[1] === undefined && !('data' in props)) {
    			console.warn("<Raw> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Raw>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Raw>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome/components/svg/Svg.svelte generated by Svelte v3.42.3 */

    const file$5 = "node_modules/svelte-awesome/components/svg/Svg.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let svg_class_value;
    	let svg_role_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "class", svg_class_value = "fa-icon " + /*className*/ ctx[0] + " svelte-1dof0an");
    			attr_dev(svg, "x", /*x*/ ctx[8]);
    			attr_dev(svg, "y", /*y*/ ctx[9]);
    			attr_dev(svg, "width", /*width*/ ctx[1]);
    			attr_dev(svg, "height", /*height*/ ctx[2]);
    			attr_dev(svg, "aria-label", /*label*/ ctx[11]);
    			attr_dev(svg, "role", svg_role_value = /*label*/ ctx[11] ? 'img' : 'presentation');
    			attr_dev(svg, "viewBox", /*box*/ ctx[3]);
    			attr_dev(svg, "style", /*style*/ ctx[10]);
    			toggle_class(svg, "fa-spin", /*spin*/ ctx[4]);
    			toggle_class(svg, "fa-pulse", /*pulse*/ ctx[6]);
    			toggle_class(svg, "fa-inverse", /*inverse*/ ctx[5]);
    			toggle_class(svg, "fa-flip-horizontal", /*flip*/ ctx[7] === 'horizontal');
    			toggle_class(svg, "fa-flip-vertical", /*flip*/ ctx[7] === 'vertical');
    			add_location(svg, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*className*/ 1 && svg_class_value !== (svg_class_value = "fa-icon " + /*className*/ ctx[0] + " svelte-1dof0an")) {
    				attr_dev(svg, "class", svg_class_value);
    			}

    			if (!current || dirty & /*x*/ 256) {
    				attr_dev(svg, "x", /*x*/ ctx[8]);
    			}

    			if (!current || dirty & /*y*/ 512) {
    				attr_dev(svg, "y", /*y*/ ctx[9]);
    			}

    			if (!current || dirty & /*width*/ 2) {
    				attr_dev(svg, "width", /*width*/ ctx[1]);
    			}

    			if (!current || dirty & /*height*/ 4) {
    				attr_dev(svg, "height", /*height*/ ctx[2]);
    			}

    			if (!current || dirty & /*label*/ 2048) {
    				attr_dev(svg, "aria-label", /*label*/ ctx[11]);
    			}

    			if (!current || dirty & /*label*/ 2048 && svg_role_value !== (svg_role_value = /*label*/ ctx[11] ? 'img' : 'presentation')) {
    				attr_dev(svg, "role", svg_role_value);
    			}

    			if (!current || dirty & /*box*/ 8) {
    				attr_dev(svg, "viewBox", /*box*/ ctx[3]);
    			}

    			if (!current || dirty & /*style*/ 1024) {
    				attr_dev(svg, "style", /*style*/ ctx[10]);
    			}

    			if (dirty & /*className, spin*/ 17) {
    				toggle_class(svg, "fa-spin", /*spin*/ ctx[4]);
    			}

    			if (dirty & /*className, pulse*/ 65) {
    				toggle_class(svg, "fa-pulse", /*pulse*/ ctx[6]);
    			}

    			if (dirty & /*className, inverse*/ 33) {
    				toggle_class(svg, "fa-inverse", /*inverse*/ ctx[5]);
    			}

    			if (dirty & /*className, flip*/ 129) {
    				toggle_class(svg, "fa-flip-horizontal", /*flip*/ ctx[7] === 'horizontal');
    			}

    			if (dirty & /*className, flip*/ 129) {
    				toggle_class(svg, "fa-flip-vertical", /*flip*/ ctx[7] === 'vertical');
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, ['default']);
    	let { class: className } = $$props;
    	let { width } = $$props;
    	let { height } = $$props;
    	let { box } = $$props;
    	let { spin = false } = $$props;
    	let { inverse = false } = $$props;
    	let { pulse = false } = $$props;
    	let { flip = null } = $$props;
    	let { x = undefined } = $$props;
    	let { y = undefined } = $$props;
    	let { style = undefined } = $$props;
    	let { label = undefined } = $$props;

    	const writable_props = [
    		'class',
    		'width',
    		'height',
    		'box',
    		'spin',
    		'inverse',
    		'pulse',
    		'flip',
    		'x',
    		'y',
    		'style',
    		'label'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(0, className = $$props.class);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('height' in $$props) $$invalidate(2, height = $$props.height);
    		if ('box' in $$props) $$invalidate(3, box = $$props.box);
    		if ('spin' in $$props) $$invalidate(4, spin = $$props.spin);
    		if ('inverse' in $$props) $$invalidate(5, inverse = $$props.inverse);
    		if ('pulse' in $$props) $$invalidate(6, pulse = $$props.pulse);
    		if ('flip' in $$props) $$invalidate(7, flip = $$props.flip);
    		if ('x' in $$props) $$invalidate(8, x = $$props.x);
    		if ('y' in $$props) $$invalidate(9, y = $$props.y);
    		if ('style' in $$props) $$invalidate(10, style = $$props.style);
    		if ('label' in $$props) $$invalidate(11, label = $$props.label);
    		if ('$$scope' in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		className,
    		width,
    		height,
    		box,
    		spin,
    		inverse,
    		pulse,
    		flip,
    		x,
    		y,
    		style,
    		label
    	});

    	$$self.$inject_state = $$props => {
    		if ('className' in $$props) $$invalidate(0, className = $$props.className);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('height' in $$props) $$invalidate(2, height = $$props.height);
    		if ('box' in $$props) $$invalidate(3, box = $$props.box);
    		if ('spin' in $$props) $$invalidate(4, spin = $$props.spin);
    		if ('inverse' in $$props) $$invalidate(5, inverse = $$props.inverse);
    		if ('pulse' in $$props) $$invalidate(6, pulse = $$props.pulse);
    		if ('flip' in $$props) $$invalidate(7, flip = $$props.flip);
    		if ('x' in $$props) $$invalidate(8, x = $$props.x);
    		if ('y' in $$props) $$invalidate(9, y = $$props.y);
    		if ('style' in $$props) $$invalidate(10, style = $$props.style);
    		if ('label' in $$props) $$invalidate(11, label = $$props.label);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		className,
    		width,
    		height,
    		box,
    		spin,
    		inverse,
    		pulse,
    		flip,
    		x,
    		y,
    		style,
    		label,
    		$$scope,
    		slots
    	];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			class: 0,
    			width: 1,
    			height: 2,
    			box: 3,
    			spin: 4,
    			inverse: 5,
    			pulse: 6,
    			flip: 7,
    			x: 8,
    			y: 9,
    			style: 10,
    			label: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*className*/ ctx[0] === undefined && !('class' in props)) {
    			console.warn("<Svg> was created without expected prop 'class'");
    		}

    		if (/*width*/ ctx[1] === undefined && !('width' in props)) {
    			console.warn("<Svg> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[2] === undefined && !('height' in props)) {
    			console.warn("<Svg> was created without expected prop 'height'");
    		}

    		if (/*box*/ ctx[3] === undefined && !('box' in props)) {
    			console.warn("<Svg> was created without expected prop 'box'");
    		}
    	}

    	get class() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get box() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set box(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverse() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverse(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pulse() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pulse(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flip() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flip(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-awesome/components/Icon.svelte generated by Svelte v3.42.3 */

    const { Object: Object_1, console: console_1$1 } = globals;

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[31] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[31] = i;
    	return child_ctx;
    }

    // (4:4) {#if self}
    function create_if_block(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*self*/ ctx[0].paths && create_if_block_3(ctx);
    	let if_block1 = /*self*/ ctx[0].polygons && create_if_block_2(ctx);
    	let if_block2 = /*self*/ ctx[0].raw && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*self*/ ctx[0].paths) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*self*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*self*/ ctx[0].polygons) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*self*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*self*/ ctx[0].raw) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*self*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
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
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(4:4) {#if self}",
    		ctx
    	});

    	return block;
    }

    // (5:6) {#if self.paths}
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*self*/ ctx[0].paths;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
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
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*self*/ 1) {
    				each_value_1 = /*self*/ ctx[0].paths;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
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
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(5:6) {#if self.paths}",
    		ctx
    	});

    	return block;
    }

    // (6:8) {#each self.paths as path, i}
    function create_each_block_1(ctx) {
    	let path;
    	let current;

    	path = new Path({
    			props: {
    				id: /*i*/ ctx[31],
    				data: /*path*/ ctx[32]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(path.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(path, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const path_changes = {};
    			if (dirty[0] & /*self*/ 1) path_changes.data = /*path*/ ctx[32];
    			path.$set(path_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(path.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(path.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(path, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(6:8) {#each self.paths as path, i}",
    		ctx
    	});

    	return block;
    }

    // (10:6) {#if self.polygons}
    function create_if_block_2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*self*/ ctx[0].polygons;
    	validate_each_argument(each_value);
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
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*self*/ 1) {
    				each_value = /*self*/ ctx[0].polygons;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(10:6) {#if self.polygons}",
    		ctx
    	});

    	return block;
    }

    // (11:8) {#each self.polygons as polygon, i}
    function create_each_block(ctx) {
    	let polygon;
    	let current;

    	polygon = new Polygon({
    			props: {
    				id: /*i*/ ctx[31],
    				data: /*polygon*/ ctx[29]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(polygon.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(polygon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const polygon_changes = {};
    			if (dirty[0] & /*self*/ 1) polygon_changes.data = /*polygon*/ ctx[29];
    			polygon.$set(polygon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(polygon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(polygon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(polygon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(11:8) {#each self.polygons as polygon, i}",
    		ctx
    	});

    	return block;
    }

    // (15:6) {#if self.raw}
    function create_if_block_1(ctx) {
    	let raw;
    	let updating_data;
    	let current;

    	function raw_data_binding(value) {
    		/*raw_data_binding*/ ctx[15](value);
    	}

    	let raw_props = {};

    	if (/*self*/ ctx[0] !== void 0) {
    		raw_props.data = /*self*/ ctx[0];
    	}

    	raw = new Raw({ props: raw_props, $$inline: true });
    	binding_callbacks.push(() => bind(raw, 'data', raw_data_binding));

    	const block = {
    		c: function create() {
    			create_component(raw.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(raw, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const raw_changes = {};

    			if (!updating_data && dirty[0] & /*self*/ 1) {
    				updating_data = true;
    				raw_changes.data = /*self*/ ctx[0];
    				add_flush_callback(() => updating_data = false);
    			}

    			raw.$set(raw_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(raw.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(raw.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(raw, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:6) {#if self.raw}",
    		ctx
    	});

    	return block;
    }

    // (3:8)      
    function fallback_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*self*/ ctx[0] && create_if_block(ctx);

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
    		p: function update(ctx, dirty) {
    			if (/*self*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*self*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(3:8)      ",
    		ctx
    	});

    	return block;
    }

    // (1:0) <Svg label={label} width={width} height={height} box={box} style={combinedStyle}   spin={spin} flip={flip} inverse={inverse} pulse={pulse} class={className}>
    function create_default_slot(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[14].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 65536)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, null),
    						null
    					);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && (!current || dirty[0] & /*self*/ 1)) {
    					default_slot_or_fallback.p(ctx, !current ? [-1, -1] : dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(1:0) <Svg label={label} width={width} height={height} box={box} style={combinedStyle}   spin={spin} flip={flip} inverse={inverse} pulse={pulse} class={className}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let svg;
    	let current;

    	svg = new Svg({
    			props: {
    				label: /*label*/ ctx[6],
    				width: /*width*/ ctx[7],
    				height: /*height*/ ctx[8],
    				box: /*box*/ ctx[10],
    				style: /*combinedStyle*/ ctx[9],
    				spin: /*spin*/ ctx[2],
    				flip: /*flip*/ ctx[5],
    				inverse: /*inverse*/ ctx[3],
    				pulse: /*pulse*/ ctx[4],
    				class: /*className*/ ctx[1],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svg.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(svg, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const svg_changes = {};
    			if (dirty[0] & /*label*/ 64) svg_changes.label = /*label*/ ctx[6];
    			if (dirty[0] & /*width*/ 128) svg_changes.width = /*width*/ ctx[7];
    			if (dirty[0] & /*height*/ 256) svg_changes.height = /*height*/ ctx[8];
    			if (dirty[0] & /*box*/ 1024) svg_changes.box = /*box*/ ctx[10];
    			if (dirty[0] & /*combinedStyle*/ 512) svg_changes.style = /*combinedStyle*/ ctx[9];
    			if (dirty[0] & /*spin*/ 4) svg_changes.spin = /*spin*/ ctx[2];
    			if (dirty[0] & /*flip*/ 32) svg_changes.flip = /*flip*/ ctx[5];
    			if (dirty[0] & /*inverse*/ 8) svg_changes.inverse = /*inverse*/ ctx[3];
    			if (dirty[0] & /*pulse*/ 16) svg_changes.pulse = /*pulse*/ ctx[4];
    			if (dirty[0] & /*className*/ 2) svg_changes.class = /*className*/ ctx[1];

    			if (dirty[0] & /*$$scope, self*/ 65537) {
    				svg_changes.$$scope = { dirty, ctx };
    			}

    			svg.$set(svg_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svg.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svg.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svg, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function normaliseData(data) {
    	if ('iconName' in data && 'icon' in data) {
    		let normalisedData = {};
    		let faIcon = data.icon;
    		let name = data.iconName;
    		let width = faIcon[0];
    		let height = faIcon[1];
    		let paths = faIcon[4];
    		let iconData = { width, height, paths: [{ d: paths }] };
    		normalisedData[name] = iconData;
    		return normalisedData;
    	}

    	return data;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, ['default']);
    	let { class: className = "" } = $$props;
    	let { data } = $$props;
    	let { scale = 1 } = $$props;
    	let { spin = false } = $$props;
    	let { inverse = false } = $$props;
    	let { pulse = false } = $$props;
    	let { flip = null } = $$props;
    	let { label = null } = $$props;
    	let { self = null } = $$props;
    	let { style = null } = $$props;

    	// internal
    	let x = 0;

    	let y = 0;
    	let childrenHeight = 0;
    	let childrenWidth = 0;
    	let outerScale = 1;
    	let width;
    	let height;
    	let combinedStyle;
    	let box;

    	function init() {
    		if (typeof data === 'undefined') {
    			return;
    		}

    		const normalisedData = normaliseData(data);
    		const [name] = Object.keys(normalisedData);
    		const icon = normalisedData[name];

    		if (!icon.paths) {
    			icon.paths = [];
    		}

    		if (icon.d) {
    			icon.paths.push({ d: icon.d });
    		}

    		if (!icon.polygons) {
    			icon.polygons = [];
    		}

    		if (icon.points) {
    			icon.polygons.push({ points: icon.points });
    		}

    		$$invalidate(0, self = icon);
    	}

    	function normalisedScale() {
    		let numScale = 1;

    		if (typeof scale !== 'undefined') {
    			numScale = Number(scale);
    		}

    		if (isNaN(numScale) || numScale <= 0) {
    			// eslint-disable-line no-restricted-globals
    			console.warn('Invalid prop: prop "scale" should be a number over 0.'); // eslint-disable-line no-console

    			return outerScale;
    		}

    		return numScale * outerScale;
    	}

    	function calculateBox() {
    		if (self) {
    			return `0 0 ${self.width} ${self.height}`;
    		}

    		return `0 0 ${width} ${height}`;
    	}

    	function calculateRatio() {
    		if (!self) {
    			return 1;
    		}

    		return Math.max(self.width, self.height) / 16;
    	}

    	function calculateWidth() {
    		if (childrenWidth) {
    			return childrenWidth;
    		}

    		if (self) {
    			return self.width / calculateRatio() * normalisedScale();
    		}

    		return 0;
    	}

    	function calculateHeight() {
    		if (childrenHeight) {
    			return childrenHeight;
    		}

    		if (self) {
    			return self.height / calculateRatio() * normalisedScale();
    		}

    		return 0;
    	}

    	function calculateStyle() {
    		let combined = "";

    		if (style !== null) {
    			combined += style;
    		}

    		let size = normalisedScale();

    		if (size === 1) {
    			if (combined.length === 0) {
    				return undefined;
    			}

    			return combined;
    		}

    		if (combined !== "" && !combined.endsWith(';')) {
    			combined += '; ';
    		}

    		return `${combined}font-size: ${size}em`;
    	}

    	const writable_props = [
    		'class',
    		'data',
    		'scale',
    		'spin',
    		'inverse',
    		'pulse',
    		'flip',
    		'label',
    		'self',
    		'style'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	function raw_data_binding(value) {
    		self = value;
    		$$invalidate(0, self);
    	}

    	$$self.$$set = $$props => {
    		if ('class' in $$props) $$invalidate(1, className = $$props.class);
    		if ('data' in $$props) $$invalidate(11, data = $$props.data);
    		if ('scale' in $$props) $$invalidate(12, scale = $$props.scale);
    		if ('spin' in $$props) $$invalidate(2, spin = $$props.spin);
    		if ('inverse' in $$props) $$invalidate(3, inverse = $$props.inverse);
    		if ('pulse' in $$props) $$invalidate(4, pulse = $$props.pulse);
    		if ('flip' in $$props) $$invalidate(5, flip = $$props.flip);
    		if ('label' in $$props) $$invalidate(6, label = $$props.label);
    		if ('self' in $$props) $$invalidate(0, self = $$props.self);
    		if ('style' in $$props) $$invalidate(13, style = $$props.style);
    		if ('$$scope' in $$props) $$invalidate(16, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Path,
    		Polygon,
    		Raw,
    		Svg,
    		className,
    		data,
    		scale,
    		spin,
    		inverse,
    		pulse,
    		flip,
    		label,
    		self,
    		style,
    		x,
    		y,
    		childrenHeight,
    		childrenWidth,
    		outerScale,
    		width,
    		height,
    		combinedStyle,
    		box,
    		init,
    		normaliseData,
    		normalisedScale,
    		calculateBox,
    		calculateRatio,
    		calculateWidth,
    		calculateHeight,
    		calculateStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ('className' in $$props) $$invalidate(1, className = $$props.className);
    		if ('data' in $$props) $$invalidate(11, data = $$props.data);
    		if ('scale' in $$props) $$invalidate(12, scale = $$props.scale);
    		if ('spin' in $$props) $$invalidate(2, spin = $$props.spin);
    		if ('inverse' in $$props) $$invalidate(3, inverse = $$props.inverse);
    		if ('pulse' in $$props) $$invalidate(4, pulse = $$props.pulse);
    		if ('flip' in $$props) $$invalidate(5, flip = $$props.flip);
    		if ('label' in $$props) $$invalidate(6, label = $$props.label);
    		if ('self' in $$props) $$invalidate(0, self = $$props.self);
    		if ('style' in $$props) $$invalidate(13, style = $$props.style);
    		if ('x' in $$props) x = $$props.x;
    		if ('y' in $$props) y = $$props.y;
    		if ('childrenHeight' in $$props) childrenHeight = $$props.childrenHeight;
    		if ('childrenWidth' in $$props) childrenWidth = $$props.childrenWidth;
    		if ('outerScale' in $$props) outerScale = $$props.outerScale;
    		if ('width' in $$props) $$invalidate(7, width = $$props.width);
    		if ('height' in $$props) $$invalidate(8, height = $$props.height);
    		if ('combinedStyle' in $$props) $$invalidate(9, combinedStyle = $$props.combinedStyle);
    		if ('box' in $$props) $$invalidate(10, box = $$props.box);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*data, style, scale*/ 14336) {
    			{
    				init();
    				$$invalidate(7, width = calculateWidth());
    				$$invalidate(8, height = calculateHeight());
    				$$invalidate(9, combinedStyle = calculateStyle());
    				$$invalidate(10, box = calculateBox());
    			}
    		}
    	};

    	return [
    		self,
    		className,
    		spin,
    		inverse,
    		pulse,
    		flip,
    		label,
    		width,
    		height,
    		combinedStyle,
    		box,
    		data,
    		scale,
    		style,
    		slots,
    		raw_data_binding,
    		$$scope
    	];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$5,
    			create_fragment$5,
    			safe_not_equal,
    			{
    				class: 1,
    				data: 11,
    				scale: 12,
    				spin: 2,
    				inverse: 3,
    				pulse: 4,
    				flip: 5,
    				label: 6,
    				self: 0,
    				style: 13
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[11] === undefined && !('data' in props)) {
    			console_1$1.warn("<Icon> was created without expected prop 'data'");
    		}
    	}

    	get class() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get spin() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set spin(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get inverse() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inverse(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pulse() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pulse(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flip() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flip(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get self() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set self(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var chevronRight = { 'chevron-right': { width: 1280, height: 1792, paths: [{ d: 'M1107 877l-742 742q-19 19-45 19t-45-19l-166-166q-19-19-19-45t19-45l531-531-531-531q-19-19-19-45t19-45l166-166q19-19 45-19t45 19l742 742q19 19 19 45t-19 45z' }] } };

    var facebook = { facebook: { width: 1024, height: 1792, paths: [{ d: 'M959 12v264h-157q-86 0-116 36t-30 108v189h293l-39 296h-254v759h-306v-759h-255v-296h255v-218q0-186 104-288.5t277-102.5q147 0 228 12z' }] } };

    var linkedin = { linkedin: { width: 1536, height: 1792, paths: [{ d: 'M349 625v991h-330v-991h330zM370 319q1 73-50.5 122t-135.5 49h-2q-82 0-132-49t-50-122q0-74 51.5-122.5t134.5-48.5 133 48.5 51 122.5zM1536 1048v568h-329v-530q0-105-40.5-164.5t-126.5-59.5q-63 0-105.5 34.5t-63.5 85.5q-11 30-11 81v553h-329q2-399 2-647t-1-296l-1-48h329v144h-2q20-32 41-56t56.5-52 87-43.5 114.5-15.5q171 0 275 113.5t104 332.5z' }] } };

    var beer = { beer: { width: 1664, height: 1792, paths: [{ d: 'M640 896v-384h-256v256q0 53 37.5 90.5t90.5 37.5h128zM1664 1344v192h-1152v-192l128-192h-128q-159 0-271.5-112.5t-112.5-271.5v-320l-64-64 32-128h480l32-128h960l32 192-64 32v800z' }] } };

    var instagram = { instagram: { width: 1536, height: 1792, paths: [{ d: 'M1024 896q0-106-75-181t-181-75-181 75-75 181 75 181 181 75 181-75 75-181zM1162 896q0 164-115 279t-279 115-279-115-115-279 115-279 279-115 279 115 115 279zM1270 486q0 38-27 65t-65 27-65-27-27-65 27-65 65-27 65 27 27 65zM768 266q-7 0-76.5-0.5t-105.5 0-96.5 3-103 10-71.5 18.5q-50 20-88 58t-58 88q-11 29-18.5 71.5t-10 103-3 96.5 0 105.5 0.5 76.5-0.5 76.5 0 105.5 3 96.5 10 103 18.5 71.5q20 50 58 88t88 58q29 11 71.5 18.5t103 10 96.5 3 105.5 0 76.5-0.5 76.5 0.5 105.5 0 96.5-3 103-10 71.5-18.5q50-20 88-58t58-88q11-29 18.5-71.5t10-103 3-96.5 0-105.5-0.5-76.5 0.5-76.5 0-105.5-3-96.5-10-103-18.5-71.5q-20-50-58-88t-88-58q-29-11-71.5-18.5t-103-10-96.5-3-105.5 0-76.5 0.5zM1536 896q0 229-5 317-10 208-124 322t-322 124q-88 5-317 5t-317-5q-208-10-322-124t-124-322q-5-88-5-317t5-317q10-208 124-322t322-124q88-5 317-5t317 5q208 10 322 124t124 322q5 88 5 317z' }] } };

    /* src/components/Header.svelte generated by Svelte v3.42.3 */
    const file$4 = "src/components/Header.svelte";

    function create_fragment$4(ctx) {
    	let header;
    	let nav;
    	let a0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let select;
    	let option0;
    	let option1;
    	let option2;
    	let t4;
    	let div1;
    	let span0;
    	let t5;
    	let span1;
    	let t6;
    	let span2;
    	let t7;
    	let div2;
    	let ul0;
    	let li0;
    	let a1;
    	let t9;
    	let li1;
    	let a2;
    	let t11;
    	let li2;
    	let a3;
    	let t13;
    	let li3;
    	let a4;
    	let t15;
    	let li4;
    	let a5;
    	let t17;
    	let ul1;
    	let li5;
    	let icon0;
    	let a6;
    	let t19;
    	let li6;
    	let icon1;
    	let a7;
    	let t21;
    	let li7;
    	let icon2;
    	let a8;
    	let current;

    	icon0 = new Icon({
    			props: { data: facebook },
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: { data: instagram },
    			$$inline: true
    		});

    	icon2 = new Icon({
    			props: { data: linkedin },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			a0 = element("a");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			select = element("select");
    			option0 = element("option");
    			option0.textContent = "Eng";
    			option1 = element("option");
    			option1.textContent = "Fra";
    			option2 = element("option");
    			option2.textContent = "Esp";
    			t4 = space();
    			div1 = element("div");
    			span0 = element("span");
    			t5 = space();
    			span1 = element("span");
    			t6 = space();
    			span2 = element("span");
    			t7 = space();
    			div2 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			a1.textContent = "Home";
    			t9 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "About";
    			t11 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Services";
    			t13 = space();
    			li3 = element("li");
    			a4 = element("a");
    			a4.textContent = "Cases";
    			t15 = space();
    			li4 = element("li");
    			a5 = element("a");
    			a5.textContent = "Contact";
    			t17 = space();
    			ul1 = element("ul");
    			li5 = element("li");
    			create_component(icon0.$$.fragment);
    			a6 = element("a");
    			a6.textContent = "Facebook";
    			t19 = space();
    			li6 = element("li");
    			create_component(icon1.$$.fragment);
    			a7 = element("a");
    			a7.textContent = "Instagram";
    			t21 = space();
    			li7 = element("li");
    			create_component(icon2.$$.fragment);
    			a8 = element("a");
    			a8.textContent = "Linkedin";
    			if (!src_url_equal(img.src, img_src_value = "img/Logo-MaxStudio-horizonltal-rgb.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "srcset", "");
    			add_location(img, file$4, 11, 12, 438);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "logo flex flex-fg-gr flex-al-vc");
    			add_location(a0, file$4, 10, 8, 373);
    			option0.__value = "eng";
    			option0.value = option0.__value;
    			add_location(option0, file$4, 19, 16, 691);
    			option1.__value = "fra";
    			option1.value = option1.__value;
    			add_location(option1, file$4, 20, 16, 740);
    			option2.__value = "esp";
    			option2.value = option2.__value;
    			add_location(option2, file$4, 21, 16, 789);
    			attr_dev(select, "name", "lang-swc");
    			attr_dev(select, "id", "");
    			add_location(select, file$4, 18, 12, 644);
    			attr_dev(div0, "class", "header__lang flex flex-al-vc");
    			add_location(div0, file$4, 17, 8, 589);
    			add_location(span0, file$4, 26, 12, 907);
    			add_location(span1, file$4, 27, 12, 928);
    			add_location(span2, file$4, 28, 12, 949);
    			attr_dev(div1, "class", "header__menu");
    			add_location(div1, file$4, 25, 8, 868);
    			attr_dev(a1, "href", "/");
    			add_location(a1, file$4, 32, 20, 1080);
    			add_location(li0, file$4, 32, 16, 1076);
    			attr_dev(a2, "href", "/About");
    			add_location(a2, file$4, 33, 20, 1126);
    			add_location(li1, file$4, 33, 16, 1122);
    			attr_dev(a3, "href", "/Services");
    			add_location(a3, file$4, 34, 20, 1178);
    			add_location(li2, file$4, 34, 16, 1174);
    			attr_dev(a4, "href", "/Cases");
    			add_location(a4, file$4, 35, 20, 1236);
    			add_location(li3, file$4, 35, 16, 1232);
    			attr_dev(a5, "href", "/Contact");
    			add_location(a5, file$4, 36, 20, 1288);
    			add_location(li4, file$4, 36, 16, 1284);
    			attr_dev(ul0, "class", "header__menu-items");
    			add_location(ul0, file$4, 31, 12, 1028);
    			attr_dev(a6, "href", "/#");
    			add_location(a6, file$4, 39, 43, 1430);
    			add_location(li5, file$4, 39, 16, 1403);
    			attr_dev(a7, "href", "/#");
    			add_location(a7, file$4, 40, 44, 1505);
    			add_location(li6, file$4, 40, 16, 1477);
    			attr_dev(a8, "href", "/#");
    			add_location(a8, file$4, 41, 43, 1581);
    			add_location(li7, file$4, 41, 16, 1554);
    			attr_dev(ul1, "class", "header__menu-social");
    			add_location(ul1, file$4, 38, 12, 1354);
    			attr_dev(div2, "class", "header__menu-content");
    			add_location(div2, file$4, 30, 8, 981);
    			attr_dev(nav, "class", "flex flex-jc-sb flex-al-vc");
    			add_location(nav, file$4, 9, 4, 324);
    			attr_dev(header, "class", "header");
    			add_location(header, file$4, 8, 0, 296);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, a0);
    			append_dev(a0, img);
    			append_dev(nav, t0);
    			append_dev(nav, div0);
    			append_dev(div0, select);
    			append_dev(select, option0);
    			append_dev(select, option1);
    			append_dev(select, option2);
    			append_dev(nav, t4);
    			append_dev(nav, div1);
    			append_dev(div1, span0);
    			append_dev(div1, t5);
    			append_dev(div1, span1);
    			append_dev(div1, t6);
    			append_dev(div1, span2);
    			append_dev(nav, t7);
    			append_dev(nav, div2);
    			append_dev(div2, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, a1);
    			append_dev(ul0, t9);
    			append_dev(ul0, li1);
    			append_dev(li1, a2);
    			append_dev(ul0, t11);
    			append_dev(ul0, li2);
    			append_dev(li2, a3);
    			append_dev(ul0, t13);
    			append_dev(ul0, li3);
    			append_dev(li3, a4);
    			append_dev(ul0, t15);
    			append_dev(ul0, li4);
    			append_dev(li4, a5);
    			append_dev(div2, t17);
    			append_dev(div2, ul1);
    			append_dev(ul1, li5);
    			mount_component(icon0, li5, null);
    			append_dev(li5, a6);
    			append_dev(ul1, t19);
    			append_dev(ul1, li6);
    			mount_component(icon1, li6, null);
    			append_dev(li6, a7);
    			append_dev(ul1, t21);
    			append_dev(ul1, li7);
    			mount_component(icon2, li7, null);
    			append_dev(li7, a8);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(icon2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Icon,
    		beer,
    		facebook,
    		instagram,
    		linkedin
    	});

    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.42.3 */
    const file$3 = "src/components/Footer.svelte";

    function create_fragment$3(ctx) {
    	let footer;
    	let div0;
    	let p;
    	let t1;
    	let div1;
    	let ul;
    	let li0;
    	let a0;
    	let icon0;
    	let t2;
    	let li1;
    	let a1;
    	let icon1;
    	let t3;
    	let li2;
    	let a2;
    	let icon2;
    	let t4;
    	let div2;
    	let a3;
    	let current;

    	icon0 = new Icon({
    			props: { data: instagram },
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: { data: facebook },
    			$$inline: true
    		});

    	icon2 = new Icon({
    			props: { data: linkedin },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			p = element("p");
    			p.textContent = "maxstudio@2021";
    			t1 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			create_component(icon0.$$.fragment);
    			t2 = space();
    			li1 = element("li");
    			a1 = element("a");
    			create_component(icon1.$$.fragment);
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			create_component(icon2.$$.fragment);
    			t4 = space();
    			div2 = element("div");
    			a3 = element("a");
    			a3.textContent = "info@maxstudio.ch";
    			add_location(p, file$3, 9, 8, 247);
    			attr_dev(div0, "class", "footer__left");
    			add_location(div0, file$3, 8, 4, 212);
    			attr_dev(a0, "href", "http://instagram/maxstudio");
    			add_location(a0, file$3, 14, 16, 390);
    			attr_dev(li0, "class", "footer__link-instagram");
    			add_location(li0, file$3, 13, 12, 338);
    			attr_dev(a1, "href", "http://facebook.com/maxstudio");
    			add_location(a1, file$3, 17, 16, 537);
    			attr_dev(li1, "class", "footer__link-facebook");
    			add_location(li1, file$3, 16, 12, 486);
    			attr_dev(a2, "href", "http://linkedin.com/maxstudio");
    			add_location(a2, file$3, 20, 16, 686);
    			attr_dev(li2, "class", "footer__link-linkedin");
    			add_location(li2, file$3, 19, 12, 635);
    			add_location(ul, file$3, 12, 8, 321);
    			attr_dev(div1, "class", "footer__center");
    			add_location(div1, file$3, 11, 4, 284);
    			attr_dev(a3, "href", "mailto:info@maxstudio.ch?subject=Testing out mailto!");
    			add_location(a3, file$3, 29, 8, 1005);
    			attr_dev(div2, "class", "footer__right");
    			add_location(div2, file$3, 28, 4, 969);
    			add_location(footer, file$3, 7, 0, 199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(div0, p);
    			append_dev(footer, t1);
    			append_dev(footer, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			mount_component(icon0, a0, null);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			mount_component(icon1, a1, null);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			mount_component(icon2, a2, null);
    			append_dev(footer, t4);
    			append_dev(footer, div2);
    			append_dev(div2, a3);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(icon2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Icon, facebook, instagram, linkedin });
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Hireus.svelte generated by Svelte v3.42.3 */

    const file$2 = "src/components/Hireus.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let b;
    	let t4;
    	let t5;
    	let div9;
    	let div2;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let div1;
    	let h20;
    	let t8;
    	let p1;
    	let t10;
    	let div5;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t11;
    	let div4;
    	let h21;
    	let t13;
    	let p2;
    	let t15;
    	let div8;
    	let div6;
    	let img2;
    	let img2_src_value;
    	let t16;
    	let div7;
    	let h22;
    	let t18;
    	let p3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "Why hire us?";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Tres motivos mais importantes que deverias ter em conta ao contratar ");
    			b = element("b");
    			b.textContent = "MaxStudio";
    			t4 = text(".");
    			t5 = space();
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t6 = space();
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = "We care about your dream";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "Our team are from different part of the world";
    			t10 = space();
    			div5 = element("div");
    			div3 = element("div");
    			img1 = element("img");
    			t11 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Vision of many different markets";
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "Experience in eruropean, brazilian and asian market";
    			t15 = space();
    			div8 = element("div");
    			div6 = element("div");
    			img2 = element("img");
    			t16 = space();
    			div7 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Straight to point";
    			t18 = space();
    			p3 = element("p");
    			p3.textContent = "Oure products are right to the target";
    			add_location(h1, file$2, 4, 4, 49);
    			add_location(b, file$2, 6, 77, 156);
    			add_location(p0, file$2, 5, 4, 75);
    			if (!src_url_equal(img0.src, img0_src_value = "img/number_1.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$2, 12, 16, 308);
    			attr_dev(div0, "class", "hireus__number");
    			add_location(div0, file$2, 11, 12, 263);
    			add_location(h20, file$2, 15, 16, 418);
    			add_location(p1, file$2, 16, 16, 468);
    			attr_dev(div1, "class", "hireus__text");
    			add_location(div1, file$2, 14, 12, 375);
    			attr_dev(div2, "class", "hireus__item");
    			add_location(div2, file$2, 10, 8, 224);
    			if (!src_url_equal(img1.src, img1_src_value = "./img/number_2.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$2, 21, 16, 647);
    			attr_dev(div3, "class", "hireus__number");
    			add_location(div3, file$2, 20, 12, 602);
    			add_location(h21, file$2, 24, 16, 759);
    			add_location(p2, file$2, 25, 16, 817);
    			attr_dev(div4, "class", "hireus__text");
    			add_location(div4, file$2, 23, 12, 716);
    			attr_dev(div5, "class", "hireus__item");
    			add_location(div5, file$2, 19, 8, 563);
    			if (!src_url_equal(img2.src, img2_src_value = "./img/number_3.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			add_location(img2, file$2, 30, 16, 1002);
    			attr_dev(div6, "class", "hireus__number");
    			add_location(div6, file$2, 29, 12, 957);
    			add_location(h22, file$2, 33, 16, 1114);
    			add_location(p3, file$2, 34, 16, 1157);
    			attr_dev(div7, "class", "hireus__text");
    			add_location(div7, file$2, 32, 12, 1071);
    			attr_dev(div8, "class", "hireus__item");
    			add_location(div8, file$2, 28, 8, 918);
    			attr_dev(div9, "class", "hireus__group");
    			add_location(div9, file$2, 8, 4, 187);
    			attr_dev(section, "class", "hireus");
    			add_location(section, file$2, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, p0);
    			append_dev(p0, t2);
    			append_dev(p0, b);
    			append_dev(p0, t4);
    			append_dev(section, t5);
    			append_dev(section, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, h20);
    			append_dev(div1, t8);
    			append_dev(div1, p1);
    			append_dev(div9, t10);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div3, img1);
    			append_dev(div5, t11);
    			append_dev(div5, div4);
    			append_dev(div4, h21);
    			append_dev(div4, t13);
    			append_dev(div4, p2);
    			append_dev(div9, t15);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div6, img2);
    			append_dev(div8, t16);
    			append_dev(div8, div7);
    			append_dev(div7, h22);
    			append_dev(div7, t18);
    			append_dev(div7, p3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Hireus', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Hireus> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Hireus extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hireus",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Quotes.svelte generated by Svelte v3.42.3 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/Quotes.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let h1;
    	let t1;
    	let p0;
    	let t2;
    	let b0;
    	let t4;
    	let t5;
    	let div0;
    	let a0;
    	let svg0;
    	let path0;
    	let t6;
    	let a1;
    	let svg1;
    	let path1;
    	let t7;
    	let div10;
    	let div9;
    	let div4;
    	let div1;
    	let p1;
    	let t8;
    	let b1;
    	let t10;
    	let t11;
    	let div3;
    	let img0;
    	let img0_src_value;
    	let t12;
    	let div2;
    	let h20;
    	let t14;
    	let p2;
    	let t16;
    	let div8;
    	let div5;
    	let p3;
    	let t17;
    	let b2;
    	let t19;
    	let t20;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t21;
    	let div6;
    	let h21;
    	let t23;
    	let p4;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "What ours clients think";
    			t1 = space();
    			p0 = element("p");
    			t2 = text("Ours clients is very happy with ");
    			b0 = element("b");
    			b0.textContent = "MaxStudio";
    			t4 = text(".");
    			t5 = space();
    			div0 = element("div");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t6 = space();
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			t7 = space();
    			div10 = element("div");
    			div9 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			p1 = element("p");
    			t8 = text("In my Experience this gone very fluid, the ");
    			b1 = element("b");
    			b1.textContent = "MaxStudio";
    			t10 = text(" se\n                        superou. Prazer trabalhar con eles!");
    			t11 = space();
    			div3 = element("div");
    			img0 = element("img");
    			t12 = space();
    			div2 = element("div");
    			h20 = element("h2");
    			h20.textContent = "We care about your dream";
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "Our team are from different part of the world";
    			t16 = space();
    			div8 = element("div");
    			div5 = element("div");
    			p3 = element("p");
    			t17 = text("In my Experience this gone very fluid, the ");
    			b2 = element("b");
    			b2.textContent = "MaxStudio";
    			t19 = text(" se\n                        superou. Prazer trabalhar con eles!");
    			t20 = space();
    			div7 = element("div");
    			img1 = element("img");
    			t21 = space();
    			div6 = element("div");
    			h21 = element("h2");
    			h21.textContent = "We care about your dream";
    			t23 = space();
    			p4 = element("p");
    			p4.textContent = "Our team are from different part of the world";
    			add_location(h1, file$1, 18, 4, 510);
    			add_location(b0, file$1, 20, 40, 591);
    			add_location(p0, file$1, 19, 4, 547);
    			attr_dev(path0, "id", "arrow");
    			attr_dev(path0, "d", "M30.243,60.918L41.237,49.924L22.23,30.918L41.237,11.913L30.243,0.918L0.243,30.918L30.243,60.918Z");
    			set_style(path0, "fill-rule", "nonzero");
    			add_location(path0, file$1, 25, 16, 989);
    			attr_dev(svg0, "width", "42px");
    			attr_dev(svg0, "height", "61px");
    			attr_dev(svg0, "version", "1.1");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg0, "xml:space", "preserve");
    			attr_dev(svg0, "xmlns:serif", "http://www.serif.com/");
    			set_style(svg0, "fill-rule", "evenodd");
    			set_style(svg0, "clip-rule", "evenodd");
    			set_style(svg0, "stroke-linejoin", "round");
    			set_style(svg0, "stroke-miterlimit", "2");
    			add_location(svg0, file$1, 24, 12, 704);
    			attr_dev(a0, "class", "quotes__right");
    			attr_dev(a0, "href", "/#");
    			add_location(a0, file$1, 23, 8, 656);
    			attr_dev(path1, "id", "arrow");
    			attr_dev(path1, "d", "M30.243,60.918L41.237,49.924L22.23,30.918L41.237,11.913L30.243,0.918L0.243,30.918L30.243,60.918Z");
    			set_style(path1, "fill-rule", "nonzero");
    			add_location(path1, file$1, 30, 16, 1509);
    			attr_dev(svg1, "width", "42px");
    			attr_dev(svg1, "height", "61px");
    			attr_dev(svg1, "version", "1.1");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg1, "xml:space", "preserve");
    			attr_dev(svg1, "xmlns:serif", "http://www.serif.com/");
    			set_style(svg1, "fill-rule", "evenodd");
    			set_style(svg1, "clip-rule", "evenodd");
    			set_style(svg1, "stroke-linejoin", "round");
    			set_style(svg1, "stroke-miterlimit", "2");
    			add_location(svg1, file$1, 29, 12, 1224);
    			attr_dev(a1, "class", "quotes__left");
    			attr_dev(a1, "href", "/#");
    			add_location(a1, file$1, 28, 8, 1177);
    			attr_dev(div0, "class", "quotes__nav");
    			add_location(div0, file$1, 22, 4, 622);
    			add_location(b1, file$1, 40, 67, 2021);
    			add_location(p1, file$1, 39, 20, 1950);
    			attr_dev(div1, "class", "quotes__text");
    			add_location(div1, file$1, 37, 16, 1840);
    			if (!src_url_equal(img0.src, img0_src_value = "./img/avatar_woman.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			add_location(img0, file$1, 45, 20, 2214);
    			add_location(h20, file$1, 47, 24, 2329);
    			add_location(p2, file$1, 48, 24, 2387);
    			attr_dev(div2, "class", "quotes__name");
    			add_location(div2, file$1, 46, 20, 2278);
    			attr_dev(div3, "class", "quotes__avatar");
    			add_location(div3, file$1, 44, 16, 2165);
    			attr_dev(div4, "class", "quotes__item");
    			add_location(div4, file$1, 36, 12, 1797);
    			add_location(b2, file$1, 57, 67, 2746);
    			add_location(p3, file$1, 56, 20, 2675);
    			attr_dev(div5, "class", "quotes__text");
    			add_location(div5, file$1, 54, 16, 2565);
    			if (!src_url_equal(img1.src, img1_src_value = "./img/avatar_woman.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 62, 20, 2939);
    			add_location(h21, file$1, 64, 24, 3054);
    			add_location(p4, file$1, 65, 24, 3112);
    			attr_dev(div6, "class", "quotes__name");
    			add_location(div6, file$1, 63, 20, 3003);
    			attr_dev(div7, "class", "quotes__avatar");
    			add_location(div7, file$1, 61, 16, 2890);
    			attr_dev(div8, "class", "quotes__item");
    			add_location(div8, file$1, 53, 12, 2522);
    			attr_dev(div9, "class", "quotes__scroll");
    			add_location(div9, file$1, 35, 8, 1756);
    			attr_dev(div10, "id", "quotes");
    			attr_dev(div10, "class", "quotes__container");
    			add_location(div10, file$1, 34, 4, 1704);
    			attr_dev(section, "class", "quotes");
    			add_location(section, file$1, 17, 0, 481);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			append_dev(section, t1);
    			append_dev(section, p0);
    			append_dev(p0, t2);
    			append_dev(p0, b0);
    			append_dev(p0, t4);
    			append_dev(section, t5);
    			append_dev(section, div0);
    			append_dev(div0, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(div0, t6);
    			append_dev(div0, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path1);
    			append_dev(section, t7);
    			append_dev(section, div10);
    			append_dev(div10, div9);
    			append_dev(div9, div4);
    			append_dev(div4, div1);
    			append_dev(div1, p1);
    			append_dev(p1, t8);
    			append_dev(p1, b1);
    			append_dev(p1, t10);
    			append_dev(div4, t11);
    			append_dev(div4, div3);
    			append_dev(div3, img0);
    			append_dev(div3, t12);
    			append_dev(div3, div2);
    			append_dev(div2, h20);
    			append_dev(div2, t14);
    			append_dev(div2, p2);
    			append_dev(div9, t16);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, p3);
    			append_dev(p3, t17);
    			append_dev(p3, b2);
    			append_dev(p3, t19);
    			append_dev(div8, t20);
    			append_dev(div8, div7);
    			append_dev(div7, img1);
    			append_dev(div7, t21);
    			append_dev(div7, div6);
    			append_dev(div6, h21);
    			append_dev(div6, t23);
    			append_dev(div6, p4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Quotes', slots, []);

    	onMount(async () => {
    		updateQuotes();
    	});

    	const updateQuotes = () => {
    		let box = document.querySelector('.quotes__container').offsetWidth;
    		console.log(box);
    		document.querySelector('.quotes__item').style['min-width'] = box + "px";
    	};

    	window.onresize = () => {
    		updateQuotes();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Quotes> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Icon,
    		chevronRight,
    		onMount,
    		updateQuotes
    	});

    	return [];
    }

    class Quotes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quotes",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.42.3 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let t0;
    	let main;
    	let header;
    	let t1;
    	let slider;
    	let t2;
    	let services;
    	let t3;
    	let hireus;
    	let t4;
    	let quotes;
    	let t5;
    	let footer;
    	let t6;
    	let div0;
    	let t7;
    	let div1;
    	let current;
    	header = new Header({ $$inline: true });
    	slider = new Slider({ $$inline: true });
    	services = new Services({ $$inline: true });
    	hireus = new Hireus({ $$inline: true });
    	quotes = new Quotes({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = space();
    			main = element("main");
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(slider.$$.fragment);
    			t2 = space();
    			create_component(services.$$.fragment);
    			t3 = space();
    			create_component(hireus.$$.fragment);
    			t4 = space();
    			create_component(quotes.$$.fragment);
    			t5 = space();
    			create_component(footer.$$.fragment);
    			t6 = space();
    			div0 = element("div");
    			t7 = space();
    			div1 = element("div");
    			document.title = "Max Studio - Digital Agency";
    			attr_dev(div0, "class", "bg-lines");
    			add_location(div0, file, 21, 1, 524);
    			attr_dev(div1, "class", "bg-bigx");
    			add_location(div1, file, 22, 1, 554);
    			attr_dev(main, "class", "landing-main");
    			add_location(main, file, 14, 0, 427);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t1);
    			mount_component(slider, main, null);
    			append_dev(main, t2);
    			mount_component(services, main, null);
    			append_dev(main, t3);
    			mount_component(hireus, main, null);
    			append_dev(main, t4);
    			mount_component(quotes, main, null);
    			append_dev(main, t5);
    			mount_component(footer, main, null);
    			append_dev(main, t6);
    			append_dev(main, div0);
    			append_dev(main, t7);
    			append_dev(main, div1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(slider.$$.fragment, local);
    			transition_in(services.$$.fragment, local);
    			transition_in(hireus.$$.fragment, local);
    			transition_in(quotes.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(slider.$$.fragment, local);
    			transition_out(services.$$.fragment, local);
    			transition_out(hireus.$$.fragment, local);
    			transition_out(quotes.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(slider);
    			destroy_component(services);
    			destroy_component(hireus);
    			destroy_component(quotes);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Slider,
    		Services,
    		Header,
    		Footer,
    		Hireus,
    		Quotes
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // import './css/styles.scss'

    const app = new App({
    	target: document.body,
    	// props: {
    	// 	name: 'world'
    	// }
    });

    return app;

}());
//# sourceMappingURL=app.js.map
