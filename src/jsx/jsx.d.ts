import 'typescript/lib/lib.dom'
import CherrySoda from './cherry-soda'
import JSX_DOM from './jsx-dom'

export = JSX;

declare global {
    namespace JSX {
        interface Element extends CherrySoda.VirtualElementInterface<any, any> {
        }

        const Fragment: CherrySoda.FakeVirtualFragmentElement;

        interface IntrinsicElements {
            // HTML
            a: CherrySoda.HTMLAttributes<JSX_DOM.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
            abbr: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            address: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            area: CherrySoda.HTMLAttributes<JSX_DOM.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
            article: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            aside: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            audio: CherrySoda.HTMLAttributes<JSX_DOM.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
            b: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            base: CherrySoda.HTMLAttributes<JSX_DOM.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
            bdi: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            bdo: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            big: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            blockquote: CherrySoda.HTMLAttributes<JSX_DOM.BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
            body: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
            br: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
            button: CherrySoda.HTMLAttributes<JSX_DOM.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
            canvas: CherrySoda.HTMLAttributes<JSX_DOM.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
            caption: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            cite: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            code: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            col: CherrySoda.HTMLAttributes<JSX_DOM.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
            colgroup: CherrySoda.HTMLAttributes<JSX_DOM.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
            data: CherrySoda.HTMLAttributes<JSX_DOM.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
            datalist: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
            dd: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            del: CherrySoda.HTMLAttributes<JSX_DOM.DelHTMLAttributes<HTMLElement>, HTMLElement>;
            details: CherrySoda.HTMLAttributes<JSX_DOM.DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
            dfn: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            dialog: CherrySoda.HTMLAttributes<JSX_DOM.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
            div: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            dl: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
            dt: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            em: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            embed: CherrySoda.HTMLAttributes<JSX_DOM.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
            fieldset: CherrySoda.HTMLAttributes<JSX_DOM.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
            figcaption: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            figure: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            footer: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            form: CherrySoda.HTMLAttributes<JSX_DOM.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
            h1: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h2: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h3: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h4: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h5: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h6: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            head: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
            header: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            hgroup: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            hr: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
            html: CherrySoda.HTMLAttributes<JSX_DOM.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
            i: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            iframe: CherrySoda.HTMLAttributes<JSX_DOM.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
            img: CherrySoda.HTMLAttributes<JSX_DOM.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
            input: CherrySoda.HTMLAttributes<JSX_DOM.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
            ins: CherrySoda.HTMLAttributes<JSX_DOM.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
            kbd: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            keygen: CherrySoda.HTMLAttributes<JSX_DOM.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
            label: CherrySoda.HTMLAttributes<JSX_DOM.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
            legend: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
            li: CherrySoda.HTMLAttributes<JSX_DOM.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
            link: CherrySoda.HTMLAttributes<JSX_DOM.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
            main: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            map: CherrySoda.HTMLAttributes<JSX_DOM.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
            mark: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            menu: CherrySoda.HTMLAttributes<JSX_DOM.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
            menuitem: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            meta: CherrySoda.HTMLAttributes<JSX_DOM.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
            meter: CherrySoda.HTMLAttributes<JSX_DOM.MeterHTMLAttributes<HTMLElement>, HTMLElement>;
            nav: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            noindex: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            noscript: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            object: CherrySoda.HTMLAttributes<JSX_DOM.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
            ol: CherrySoda.HTMLAttributes<JSX_DOM.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
            optgroup: CherrySoda.HTMLAttributes<JSX_DOM.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
            option: CherrySoda.HTMLAttributes<JSX_DOM.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
            output: CherrySoda.HTMLAttributes<JSX_DOM.OutputHTMLAttributes<HTMLElement>, HTMLElement>;
            p: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
            param: CherrySoda.HTMLAttributes<JSX_DOM.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
            picture: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            pre: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
            progress: CherrySoda.HTMLAttributes<JSX_DOM.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
            q: CherrySoda.HTMLAttributes<JSX_DOM.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
            rp: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            rt: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            ruby: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            s: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            samp: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            slot: CherrySoda.HTMLAttributes<JSX_DOM.SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
            script: CherrySoda.HTMLAttributes<JSX_DOM.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
            section: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            select: CherrySoda.HTMLAttributes<JSX_DOM.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
            small: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            source: CherrySoda.HTMLAttributes<JSX_DOM.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
            span: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
            strong: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            style: CherrySoda.HTMLAttributes<JSX_DOM.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
            sub: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            summary: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            sup: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            table: CherrySoda.HTMLAttributes<JSX_DOM.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
            template: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
            tbody: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
            td: CherrySoda.HTMLAttributes<JSX_DOM.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
            textarea: CherrySoda.HTMLAttributes<JSX_DOM.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
            tfoot: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
            th: CherrySoda.HTMLAttributes<JSX_DOM.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
            thead: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
            time: CherrySoda.HTMLAttributes<JSX_DOM.TimeHTMLAttributes<HTMLElement>, HTMLElement>;
            title: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
            tr: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
            track: CherrySoda.HTMLAttributes<JSX_DOM.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
            u: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            ul: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
            "var": CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            video: CherrySoda.HTMLAttributes<JSX_DOM.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
            wbr: CherrySoda.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            // webview: CherrySoda.HTMLAttributes<JSX_DOM.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;

            // SVG
            // svg: React.SVGProps<SVGSVGElement>;

            /*animate: React.SVGProps<SVGElement>; // TODO: It is SVGAnimateElement but is not in TypeScript's lib.dom.d.ts for now.
            animateMotion: React.SVGProps<SVGElement>;
            animateTransform: React.SVGProps<SVGElement>; // TODO: It is SVGAnimateTransformElement but is not in TypeScript's lib.dom.d.ts for now.
            circle: React.SVGProps<SVGCircleElement>;
            clipPath: React.SVGProps<SVGClipPathElement>;
            defs: React.SVGProps<SVGDefsElement>;
            desc: React.SVGProps<SVGDescElement>;
            ellipse: React.SVGProps<SVGEllipseElement>;
            feBlend: React.SVGProps<SVGFEBlendElement>;
            feColorMatrix: React.SVGProps<SVGFEColorMatrixElement>;
            feComponentTransfer: React.SVGProps<SVGFEComponentTransferElement>;
            feComposite: React.SVGProps<SVGFECompositeElement>;
            feConvolveMatrix: React.SVGProps<SVGFEConvolveMatrixElement>;
            feDiffuseLighting: React.SVGProps<SVGFEDiffuseLightingElement>;
            feDisplacementMap: React.SVGProps<SVGFEDisplacementMapElement>;
            feDistantLight: React.SVGProps<SVGFEDistantLightElement>;
            feDropShadow: React.SVGProps<SVGFEDropShadowElement>;
            feFlood: React.SVGProps<SVGFEFloodElement>;
            feFuncA: React.SVGProps<SVGFEFuncAElement>;
            feFuncB: React.SVGProps<SVGFEFuncBElement>;
            feFuncG: React.SVGProps<SVGFEFuncGElement>;
            feFuncR: React.SVGProps<SVGFEFuncRElement>;
            feGaussianBlur: React.SVGProps<SVGFEGaussianBlurElement>;
            feImage: React.SVGProps<SVGFEImageElement>;
            feMerge: React.SVGProps<SVGFEMergeElement>;
            feMergeNode: React.SVGProps<SVGFEMergeNodeElement>;
            feMorphology: React.SVGProps<SVGFEMorphologyElement>;
            feOffset: React.SVGProps<SVGFEOffsetElement>;
            fePointLight: React.SVGProps<SVGFEPointLightElement>;
            feSpecularLighting: React.SVGProps<SVGFESpecularLightingElement>;
            feSpotLight: React.SVGProps<SVGFESpotLightElement>;
            feTile: React.SVGProps<SVGFETileElement>;
            feTurbulence: React.SVGProps<SVGFETurbulenceElement>;
            filter: React.SVGProps<SVGFilterElement>;
            foreignObject: React.SVGProps<SVGForeignObjectElement>;
            g: React.SVGProps<SVGGElement>;
            image: React.SVGProps<SVGImageElement>;
            line: React.SVGProps<SVGLineElement>;
            linearGradient: React.SVGProps<SVGLinearGradientElement>;
            marker: React.SVGProps<SVGMarkerElement>;
            mask: React.SVGProps<SVGMaskElement>;
            metadata: React.SVGProps<SVGMetadataElement>;
            mpath: React.SVGProps<SVGElement>;
            path: React.SVGProps<SVGPathElement>;
            pattern: React.SVGProps<SVGPatternElement>;
            polygon: React.SVGProps<SVGPolygonElement>;
            polyline: React.SVGProps<SVGPolylineElement>;
            radialGradient: React.SVGProps<SVGRadialGradientElement>;
            rect: React.SVGProps<SVGRectElement>;
            stop: React.SVGProps<SVGStopElement>;
            switch: React.SVGProps<SVGSwitchElement>;
            symbol: React.SVGProps<SVGSymbolElement>;
            text: React.SVGProps<SVGTextElement>;
            textPath: React.SVGProps<SVGTextPathElement>;
            tspan: React.SVGProps<SVGTSpanElement>;
            use: React.SVGProps<SVGUseElement>;
            view: React.SVGProps<SVGViewElement>;*/
        }
    }
}
