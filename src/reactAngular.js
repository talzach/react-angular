import React, { PropTypes as t } from 'react';
import angular from 'angular';

export default class ReactAngular extends React.Component {
  componentDidMount() {
    const { controller, controllerAs, inject, isolate, scope, template, templateUrl } = this.props;

    const parentScope = this.$element.scope();
    const $injector = this.$element.injector();

    const $controller = $injector.get('$controller');
    const $compile = $injector.get('$compile');
    const $rootScope = $injector.get('$rootScope');
    const $templateCache = $injector.get('$templateCache');

    this.$scope = scope ? parentScope.$new(isolate) : parentScope;

    if (angular.isObject(scope)) {
      angular.extend(this.$scope, scope);
    }

    const actualTemplateFunc = template || (templateUrl ? $templateCache.get(templateUrl) : null);

    const actualTemplate = angular.isFunction(actualTemplateFunc)
      ? actualTemplateFunc(inject)
      : actualTemplateFunc;

    if (controller) {
      const instantiatedController = $controller(controller, {
        ...inject,
        $scope: this.$scope,
        $element: this.$element,
      });

      if (controllerAs) {
        this.$scope[controllerAs] = instantiatedController;
      }
    }

    if (actualTemplate) {
      this.$element.append(actualTemplate);
    }

    $compile(this.$element)(this.$scope);
    $rootScope.$evalAsync();
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { wrapperTag, className, wrapperAttrs } = this.props;

    return React.createElement(wrapperTag, {
      ...wrapperAttrs,
      ref: (element) => this.$element = angular.element(element),
      className,
    }, '');
  }
}

ReactAngular.propTypes = {
  className: t.string,
  controller: t.any,
  controllerAs: t.string,
  inject: t.object,
  isolate: t.bool,
  scope: t.oneOfType([t.bool, t.object]),
  template: t.oneOfType([t.string, t.func]),
  templateUrl: t.string,
  wrapperTag: t.string,
  wrapperAttrs: t.object,
};

ReactAngular.defaultProps = {
  inject: {},
  isolate: false,
  scope: true,
  wrapperTag: 'div',
  wrapperAttrs: {},
};
