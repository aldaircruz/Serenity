﻿namespace Serenity {


    export interface WidgetClass<TOptions = object> {
        new(element: JQuery, options?: TOptions): Widget<TOptions>;
        element: JQuery;
    }

    export interface WidgetDialogClass<TOptions = object> {
        new(options?: TOptions): Widget<TOptions> & IDialog;
        element: JQuery;
    }

    export type AnyWidgetClass<TOptions = object> = WidgetClass<TOptions> | WidgetDialogClass<TOptions>;

    if (typeof React === "undefined" && typeof window !== "undefined") {
        if (window['preact'] != null) {
            window['React'] = window['ReactDOM'] = window['preact'];
            (React as any).Fragment = Q.coalesce((React as any).Fragment, "x-fragment");
        }
        else if (window['Nerv'] != null) {
            window['React'] = window['ReactDOM'] = window['Nerv'];
            (React as any).Fragment = Q.coalesce((React as any).Fragment, "x-fragment");
        }
        else {
            window['React'] = {
                Component: function () { } as any,
                Fragment: "x-fragment" as any,
                createElement: function () { return { _reactNotLoaded: true }; } as any
            } as any
            window['ReactDOM'] = {
                render: function () { throw Error("To use React, it should be included before Serenity.CoreLib.js"); }
            }
        }
    }

    @Serenity.Decorators.registerClass()
    export class Widget<TOptions> extends React.Component<TOptions, any> {
        private static nextWidgetNumber = 0;
        public element: JQuery;
        protected options: TOptions;
        protected widgetName: string;
        protected uniqueName: string;

        constructor(element: JQuery, options?: TOptions) {
            super(options);

            this.element = element;
            this.options = options || ({} as TOptions);

            this.widgetName = Widget.getWidgetName(Q.getInstanceType(this));
            this.uniqueName = this.widgetName + (Widget.nextWidgetNumber++).toString();

            if (element.data(this.widgetName)) {
                throw new Q.Exception(Q.format("The element already has widget '{0}'!", this.widgetName));
            }

            element.on('remove.' + this.widgetName, e => {
                if (e.bubbles || e.cancelable) {
                    return;
                }
                this.destroy();
            }).data(this.widgetName, this);

            this.addCssClass();
        }

        public destroy(): void {
            this.element.removeClass('s-' + Q.getTypeName(Q.getInstanceType(this)));
            this.element.off('.' + this.widgetName).off('.' + this.uniqueName).removeData(this.widgetName);
            this.element = null;
        }

        protected addCssClass(): void {
            this.element.addClass(this.getCssClass());
        }

        protected getCssClass(): string {
            var type = Q.getInstanceType(this);
            var klass = 's-' + Q.getTypeName(type);
            var fullClass = Q.replaceAll(Q.getTypeFullName(type), '.', '-');

            for (let k of Q.Config.rootNamespaces) {
                if (Q.startsWith(fullClass, k + '-')) {
                    fullClass = fullClass.substr(k.length + 1);
                    break;
                }
            }

            fullClass = 's-' + fullClass;
            if (klass === fullClass) {
                return klass;
            }

            return klass + ' ' + fullClass;
        }

        public static getWidgetName(type: Function): string {
            return Q.replaceAll(Q.getTypeFullName(type), '.', '_');
        }

        public static elementFor<TWidget>(editorType: { new (...args: any[]): TWidget }): JQuery {
            var elementAttr = Q.getAttributes(editorType, Serenity.ElementAttribute, true);
            var elementHtml = ((elementAttr.length > 0) ? elementAttr[0].value : '<input/>');
            return $(elementHtml);
        };

        public addValidationRule(eventClass: string, rule: (p1: JQuery) => string): JQuery {
            return Q.addValidationRule(this.element, eventClass, rule);
        }   

        public static create<TWidget extends Widget<TOpt>, TOpt>(params: CreateWidgetParams<TWidget, TOpt>) {
            let widget: TWidget;

            if (Q.isAssignableFrom(Serenity.IDialog, params.type)) {
                widget = new (params.type as any)(params.options);
                if (params.container)
                    widget.element.appendTo(params.container);
                params.element && params.element(widget.element);
            }
            else {
                var e = Widget.elementFor(params.type);
                if (params.container)
                    e.appendTo(params.container);
                params.element && params.element(e);
                widget = new params.type(e, params.options);
            }

            widget.init(null);
            params.init && params.init(widget);

            return widget;
        }

        public init(action?: (widget: any) => void): this {
            action && action(this);
            return this;
        }

        private static __isWidgetType = true;
        props: Readonly<{ children?: React.ReactNode }> & Readonly<TOptions> & WidgetComponentProps<this>;
    }

    export interface WidgetComponentProps<W extends Serenity.Widget<any>> {
        id?: string;
        name?: string;
        className?: string;
        maxLength?: number;
        placeholder?: string;
        setOptions?: any;
        required?: boolean;
        readOnly?: boolean;
        oneWay?: boolean;
        onChange?: (e: JQueryEventObject) => void;
        onChangeSelect2?: (e: JQueryEventObject) => void;
        value?: any;
        defaultValue?: any;
    }

    export declare interface Widget<TOptions> {
        getGridField(): JQuery;
        change(handler: (e: JQueryEventObject) => void): void;
        changeSelect2(handler: (e: JQueryEventObject) => void): void;
    }
}

