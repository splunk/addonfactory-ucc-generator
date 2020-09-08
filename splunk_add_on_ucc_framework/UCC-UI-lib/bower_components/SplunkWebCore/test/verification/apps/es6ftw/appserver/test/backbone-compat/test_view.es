import ES6ViewSuperclass from 'app/es6ftw/backbone/ES6ViewSuperclass';
import ES6ToES5ViewSubclass from 'app/es6ftw/backbone/ES6ToES5ViewSubclass';
import ES6ToES6ViewSubclass from 'app/es6ftw/backbone/ES6ToES6ViewSubclass';

suite('ES6 View subclassing BaseView', function () {
    setup(function () {
        this.view = new ES6ViewSuperclass({});
        this.view.render();
        sinon.spy(this.view, 'clickHandler');
    });

    test('respects custom tag name', function () {
        assert.isTrue(this.view.$el.is('span'), 'tag name is correct');
    });

    test('renders a template', function () {
        assert.equal(this.view.$('a').length, 1, 'template was rendered');
    });

    test('DOM events are wired up', function () {
        this.view.$('a').trigger('click');
        assert.equal(this.view.clickHandler.callCount, 1, 'click handler fired');
    });

    test('Module ID is correct', function () {
        assert.equal(this.view.moduleId, 'app/es6ftw/backbone/ES6ViewSuperclass');
    });
});

suite('ES5 View subclassing ES6 View', function () {
    setup(function () {
        this.view = new ES6ToES5ViewSubclass({
            constructorOption: 'construct!',
            initializeOption: 'initialize!',
        });
        this.view.render();
        sinon.spy(this.view, 'clickHandler');
        sinon.spy(this.view, 'mouseOverHandler');
    });

    test('constructor extended correctly', function () {
        assert.equal(this.view.es6SuperConstructed, 'construct!', 'super constructor was run');
        assert.equal(this.view.es5SubclassConstructed, 'construct!',
            'subclass constructor was run');
    });

    test('initialize extended correctly', function () {
        assert.equal(this.view.es6SuperInitialized, 'initialize!', 'super initialize was run');
        assert.equal(this.view.es5SubclassInitialized, 'initialize!',
            'subclass initialize was run');
    });

    test('tag name overridden correctly', function () {
        assert.isTrue(this.view.$el.is('h1'), 'tag name is correct');
    });

    test('template overridden correctly', function () {
        assert.equal(this.view.$('a').length, 2, 'renders subclass template');
    });

    test('events hash extended correctly', function () {
        this.view.$('a').eq(0).trigger('click');
        assert.equal(this.view.clickHandler.callCount, 1, 'click handler fired');
        this.view.$('a').eq(0).trigger('mouseover');
        assert.equal(this.view.mouseOverHandler.callCount, 1, 'mouseover handler fired');
    });

    test('static properties handled correctly', function () {
        assert.equal(ES6ViewSuperclass.es6staticProp, 'A static prop from es6');
        assert.isUndefined(ES6ViewSuperclass.es5SubclassStaticProp);
        assert.equal(ES6ToES5ViewSubclass.es6staticProp, 'A static prop from es6');
        assert.equal(ES6ToES5ViewSubclass.es5SubclassStaticProp,
            'A static prop from the es5 subclass');
    });
});

suite('ES6 View subclassing ES6 View', function () {
    setup(function () {
        this.view = new ES6ToES6ViewSubclass({
            constructorOption: 'construct!',
            initializeOption: 'initialize!',
        });
        this.view.render();
        sinon.spy(this.view, 'clickHandler');
        sinon.spy(this.view, 'mouseOutHandler');
    });

    test('constructor extended correctly', function () {
        assert.equal(this.view.es6SuperConstructed, 'construct!', 'super constructor was run');
        assert.equal(this.view.es6SubclassConstructed, 'construct!',
            'subclass constructor was run');
    });

    test('initialize extended correctly', function () {
        assert.equal(this.view.es6SuperInitialized, 'initialize!', 'super initialize was run');
        assert.equal(this.view.es6SubclassInitialized, 'initialize!',
            'subclass initialize was run');
    });

    test('tag name overridden correctly', function () {
        assert.isTrue(this.view.$el.is('h2'), 'tag name is correct');
    });

    test('template overridden correctly', function () {
        assert.equal(this.view.$('a').length, 3, 'renders subclass template');
    });

    test('events hash extended correctly', function () {
        this.view.$('a').eq(0).trigger('click');
        assert.equal(this.view.clickHandler.callCount, 1, 'click handler fired');
        this.view.$('a').eq(0).trigger('mouseout');
        assert.equal(this.view.mouseOutHandler.callCount, 1, 'mouseout handler fired');
    });

    test('static properties handled correctly', function () {
        assert.equal(ES6ViewSuperclass.es6staticProp, 'A static prop from es6');
        assert.isUndefined(ES6ViewSuperclass.es6SubclassStaticProp);
        assert.equal(ES6ToES6ViewSubclass.es6staticProp, 'A static prop from es6');
        assert.equal(ES6ToES6ViewSubclass.es6SubclassStaticProp,
            'A static prop from the es6 subclass');
    });
});
