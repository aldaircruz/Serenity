﻿using jQueryApi;
using System;
using System.Runtime.CompilerServices;

namespace Serenity
{
    [ScriptName("WX")]
    public static class WidgetExtensions
    {
        public static TWidget GetWidget<TWidget>(this jQueryObject element) where TWidget : Widget
        {
            var widget = TryGetWidget<TWidget>(element);
            if (widget == null)
                throw new Exception(String.Format("Element has no widget of type '{0}'!", GetWidgetName(typeof(TWidget))));

            return widget;
        }

        public static object GetWidget(this jQueryObject element, Type widgetType)
        {
            var widget = TryGetWidget(element, widgetType);
            if (widget == null)
                throw new Exception(String.Format("Element has no widget of type '{0}'!", GetWidgetName(widgetType)));

            return widget;
        }

        public static TWidget TryGetWidget<TWidget>(this jQueryObject element) where TWidget : Widget
        {
            if (element == null)
                throw new Exception("Argument 'element' is null!");

            var widgetName = WidgetExtensions.GetWidgetName(typeof(TWidget));

            return element.GetDataValue(widgetName) as TWidget;
        }

        public static object TryGetWidget(this jQueryObject element, Type widgetType)
        {
            if (widgetType == null)
                throw new Exception("Argument 'widgetType' is null!");

            if (element == null)
                throw new Exception("Argument 'element' is null!");

            var widgetName = WidgetExtensions.GetWidgetName(widgetType);
            var widget = element.GetDataValue(widgetName);

            if (widget != null && !widgetType.IsAssignableFrom(widget.GetType()))
                return null;

            return widget;
        }

        public static string GetWidgetName(Type type)
        {
            return type.FullName.Replace(".", "_");
        }

        public static bool HasOriginalEvent(this jQueryEvent e)
        {
            return !Script.IsUndefined(((dynamic)e).originalEvent);
        }

        [IncludeGenericArguments(false)] // saltarelle bug ı var, değiştirme
        public static void Change<TWidget>(this TWidget widget, jQueryEventHandler handler)
            where TWidget: Widget
        {
            widget.Element.Bind("change." + widget.UniqueName, handler);
        }

        [IncludeGenericArguments(false)] // saltarelle bug ı var, değiştirme
        public static void ChangeSelect2<TWidget>(this TWidget widget, jQueryEventHandler handler)
            where TWidget : Widget
        {
            widget.Element.Bind2("change." + widget.UniqueName, (e, x) =>
            {
                if (e.HasOriginalEvent() || Q.IsFalse(x))
                {
                    handler(e);
                }
            });
        }

        public static jQueryObject GetGridField(this Widget widget)
        {
            return widget.Element.Closest(".field");
        }

        [IncludeGenericArguments(false)]
        public static TWidget Init<TWidget>(this TWidget widget, Action<TWidget> action = null)
            where TWidget: Widget
        {
            widget.Init(w =>
            {
                action(widget);
            });

            return widget;
        }

        [InlineCode("{obj}.bind({eventName}, {handler})")]
        public static jQueryObject Bind2(this jQueryObject obj, string eventName, Action<jQueryEvent, dynamic> handler)
        {
            return null;
        }
        
        [Obsolete("Use Widget.Create")]
        public static TWidget Create<TWidget>(Action<jQueryObject> initElement, object options = null)
            where TWidget : Widget
        {
            return Widget.Create<TWidget>(initElement, options);
        }
    }
}
