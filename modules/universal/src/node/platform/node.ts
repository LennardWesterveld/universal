// Compiler
import {COMPILER_PROVIDERS, XHR} from '@angular/compiler';

// Animate
// import {BrowserDetails} from '@angular/platform-browser/src/animate/browser_details';
// import {AnimationBuilder} from '@angular/platform-browser/src/animate/animation_builder';

// Core
import {Testability} from '@angular/core/src/testability/testability';
import {ReflectionCapabilities} from '@angular/core/src/reflection/reflection_capabilities';
import {DirectiveResolver, CompilerConfig} from '@angular/compiler';
import {
  provide,
  Provider,
  coreLoadAndBootstrap,
  ReflectiveInjector,
  PLATFORM_INITIALIZER,
  PLATFORM_COMMON_PROVIDERS,
  PLATFORM_DIRECTIVES,
  PLATFORM_PIPES,
  APPLICATION_COMMON_PROVIDERS,
  ComponentRef,
  createPlatform,
  ExceptionHandler,
  Renderer,
  NgZone,
  OpaqueToken,
  Type
} from '@angular/core';

// Common
import {COMMON_DIRECTIVES, COMMON_PIPES, FORM_PROVIDERS, PlatformLocation} from '@angular/common';


// Platform.Dom
import {EventManager, EVENT_MANAGER_PLUGINS} from '@angular/platform-browser/src/dom/events/event_manager';
import {DomEventsPlugin} from '@angular/platform-browser/src/dom/events/dom_events';
import {KeyEventsPlugin} from '@angular/platform-browser/src/dom/events/key_events';
import {HammerGesturesPlugin} from '@angular/platform-browser/src/dom/events/hammer_gestures';
// import {BROWSER_SANITIZATION_PROVIDERS} from'@angular/platform-browser'; // see provate below
import {DomSharedStylesHost, SharedStylesHost} from '@angular/platform-browser/src/dom/shared_styles_host';
import {
  HAMMER_GESTURE_CONFIG,
  HammerGestureConfig
} from '@angular/platform-browser/src/dom/events/hammer_gestures';

import {DOCUMENT} from '@angular/platform-browser/src/dom/dom_tokens';
import {DomRootRenderer} from '@angular/platform-browser/src/dom/dom_renderer';
import {RootRenderer} from '@angular/core/src/render/api';

import {TemplateParser} from '@angular/compiler/src/template_parser';

import {NodeDomRootRenderer_} from './dom/node_dom_renderer';
import {NodeXHRImpl} from './node_xhr_impl';
import {NodeSharedStylesHost} from './node_shared_styles_host';
import {NodeTemplateParser} from './node_template_parser-rc4';
import {NodeTemplateParserRc13} from './node_template_parser-rc1-3';
import {NodeTemplateParserRc0} from './node_template_parser-rc.0';
import {NODE_PLATFORM_DIRECTIVES} from '../directives';
import {NodePlatformLocation} from '../router/node_platform_location';
// should be Private
import {WebAnimationsDriver} from '@angular/platform-browser/src/dom/web_animations_driver';
import {reflector} from '@angular/core/src/reflection/reflection';
import {AnimationDriver, NoOpAnimationDriver} from '@angular/core/src/animation/animation_driver';
var CONST_EXPR = v => v;
import '../make_parse5_current'; // ensure Parse5DomAdapter is used
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {isPresent} from '../../common';
var {ELEMENT_PROBE_PROVIDERS, BROWSER_SANITIZATION_PROVIDERS} = require('@angular/platform-browser');
if (!ELEMENT_PROBE_PROVIDERS) {
  ELEMENT_PROBE_PROVIDERS = require('@angular/platform-browser/src/dom/debug/ng_probe').ELEMENT_PROBE_PROVIDERS;
}
var DOM: any = getDOM();
var isRc0 = require('@angular/core/package.json').version.indexOf('-rc.0') !== -1;
var isRc4 = require('@angular/core/package.json').version.indexOf('-rc.4') !== -1;
function arrayFlattenTree(children: any[], arr: any[] = []): any[] {
  for (let child of children) {
    if (Array.isArray(child)) {
      arrayFlattenTree(child, arr);
    } else {
      arr.push(child);
    }
  }
  return arr;
}

export function initNodeAdapter() {
}

export const NODE_APP_PLATFORM_MARKER = new OpaqueToken('NodeAppPlatformMarker');

export const NODE_APP_PLATFORM: Array<any> = CONST_EXPR([
  ...PLATFORM_COMMON_PROVIDERS,
  {provide: NODE_APP_PLATFORM_MARKER, useValue: true},
  {provide: PLATFORM_INITIALIZER, useValue: initNodeAdapter, multi: true},
  {provide: PlatformLocation, useClass: NodePlatformLocation}
]);

function _exceptionHandler(): ExceptionHandler {
  return new ExceptionHandler(getDOM(), false);
}

function _document(): any {
  return getDOM().createHtmlDocument();
}

export const NODE_APP_COMMON_PROVIDERS: Array<any> = CONST_EXPR([
  ...APPLICATION_COMMON_PROVIDERS,
  ...FORM_PROVIDERS,
  ...BROWSER_SANITIZATION_PROVIDERS,
  {provide: ExceptionHandler, useFactory: _exceptionHandler, deps: []},
  {provide: PLATFORM_PIPES, useValue: COMMON_PIPES, multi: true},
  {provide: PLATFORM_DIRECTIVES, useValue: COMMON_DIRECTIVES, multi: true},
  ...NODE_PLATFORM_DIRECTIVES,
  {provide: DOCUMENT, useFactory: () => _document },
  {provide: EVENT_MANAGER_PLUGINS, useClass: DomEventsPlugin, multi: true},
  {provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, multi: true},
  {provide: EVENT_MANAGER_PLUGINS, useClass: HammerGesturesPlugin, multi: true},
  {provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig},
  {provide: DomRootRenderer, useClass: NodeDomRootRenderer_},
  {provide: RootRenderer, useExisting: DomRootRenderer},
  {provide: SharedStylesHost, useExisting: NodeSharedStylesHost},
  {provide: DomSharedStylesHost, useExisting: NodeSharedStylesHost},
  {provide: AnimationDriver, useClass: NoOpAnimationDriver},
  {provide: WebAnimationsDriver, useExisting: AnimationDriver},
  NodeSharedStylesHost,
  Testability,
  // BrowserDetails,
  // AnimationBuilder,
  EventManager,
  ...(ELEMENT_PROBE_PROVIDERS || [])
]);

// console.log('\n NODE_APP_COMMON_PROVIDERS \n', arrayFlattenTree(NODE_APP_COMMON_PROVIDERS).map((provider, id, collection) => {
//   if (provider === undefined) {
//     console.log('provider undefined: ', collection[id-1], collection[id], collection[id+1])
//     return undefined;
//   }
//   let token = provider.provide || provider;
//   return (token.id || id) + ': ' + (token.name || token._desc);
// }));

/**
 * An array of providers that should be passed into `application()` when bootstrapping a component.
 */
 const templateParser = isRc0 ? NodeTemplateParserRc0 : isRc4 ? NodeTemplateParser : NodeTemplateParserRc13;
export const NODE_APP_PROVIDERS: Array<any> = CONST_EXPR([
  ...NODE_APP_COMMON_PROVIDERS,
  ...COMPILER_PROVIDERS,
  {
    provide: CompilerConfig,
    useFactory: (platformDirectives: any[], platformPipes: any[]) => {
      return new CompilerConfig({platformDirectives, platformPipes});
    },
    deps: [PLATFORM_DIRECTIVES, PLATFORM_PIPES]
  },
  ...(TemplateParser ? [{provide: TemplateParser, useClass: templateParser}] : []),
  ...(XHR ? [{provide: XHR, useClass: NodeXHRImpl}] : []),
]);

// console.log('\n NODE_APP_PROVIDERS \n', arrayFlattenTree(NODE_APP_PROVIDERS).map((provider, id, collection) => {
//   if (provider === undefined) {
//     console.log('provider undefined: ', collection[id-1], collection[id], collection[id+1])
//     return undefined;
//   }
//   let token = provider.provide || provider;
//   if (token === undefined) {
//     console.log('provider token undefined: ', collection[id-1], collection[id], collection[id+1])
//     return undefined;
//   }
//   return (token.id || id) + ': ' + (token.name || token._desc);
// }));

/**
 *
 */
export function bootstrap(
  appComponentType: Type,
  customAppProviders: Array<any> = null,
  customComponentProviders: Array<any> = null): Promise<ComponentRef<any>> {

  buildReflector();

  let appProviders: Array<any> = [
    ...NODE_APP_PROVIDERS,

    {
      provide: DOCUMENT,
      useFactory: (directiveResolver, sharedStylesHost) => {
        // TODO(gdi2290): determine a better for document on the server
        let selector = directiveResolver.resolve(appComponentType);
        let serverDocument = DOM.createHtmlDocument();
        let el = DOM.createElement(selector);
        DOM.appendChild(serverDocument.body, el);
        sharedStylesHost.addHost(serverDocument.head);
        return serverDocument;
      },
      deps: [DirectiveResolver, NodeSharedStylesHost]
    },

    ...(isPresent(customAppProviders) ? customAppProviders : [])
  ];

  let componentProviders: Array<any> = [
    ...(isPresent(customComponentProviders) ? customComponentProviders : [])
  ];

  let platform = createPlatform(ReflectiveInjector.resolveAndCreate(NODE_APP_PLATFORM));
  return coreLoadAndBootstrap(appComponentType, platform.injector);
}


export function buildReflector(): void {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
}

export function buildNodeProviders(providers?: Array<any>): Array<any> {
  return [
    ...NODE_APP_PLATFORM,
    ...(isPresent(providers) ? providers : [])
  ];
}

export function buildNodeAppProviders(document?: any, providers?: Array<any>): Array<any> {
  return [
    ...NODE_APP_PROVIDERS,
    (isPresent(document) && document) ? [
      new Provider(DOCUMENT, {
        useFactory: (sharedStylesHost) => {
          sharedStylesHost.addHost(document.head);
          return document;
        },
        deps: [NodeSharedStylesHost]
      })
    ] : [],
    ...(isPresent(providers) && providers) ? providers : []
  ];
}

export function buildNodePlatformProviders(
  appComponentType: Type,
  providers?: Array<any>): Array<any> {

  return [
    ...NODE_APP_PLATFORM,
    ...(isPresent(providers) ? providers : [])
  ];
}
