import 'typescript/lib/lib.dom'
import CherryCola from './cherry-cola'
import JSX_DOM from './jsx-dom'

export {}

declare global {
    namespace JSX {
        interface Element extends CherryCola.VirtualElement<any, any> {
        }

        const Fragment: CherryCola.FakeVirtualFragmentElement;

        interface IntrinsicElements {
            // HTML
            a: CherryCola.HTMLAttributes<JSX_DOM.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
            abbr: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            address: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            area: CherryCola.HTMLAttributes<JSX_DOM.AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
            article: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            aside: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            audio: CherryCola.HTMLAttributes<JSX_DOM.AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
            b: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            base: CherryCola.HTMLAttributes<JSX_DOM.BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
            bdi: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            bdo: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            big: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            blockquote: CherryCola.HTMLAttributes<JSX_DOM.BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
            body: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
            br: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
            button: CherryCola.HTMLAttributes<JSX_DOM.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
            canvas: CherryCola.HTMLAttributes<JSX_DOM.CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
            caption: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            cite: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            code: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            col: CherryCola.HTMLAttributes<JSX_DOM.ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
            colgroup: CherryCola.HTMLAttributes<JSX_DOM.ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
            data: CherryCola.HTMLAttributes<JSX_DOM.DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
            datalist: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
            dd: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            del: CherryCola.HTMLAttributes<JSX_DOM.DelHTMLAttributes<HTMLElement>, HTMLElement>;
            details: CherryCola.HTMLAttributes<JSX_DOM.DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
            dfn: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            dialog: CherryCola.HTMLAttributes<JSX_DOM.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
            div: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            dl: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
            dt: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            em: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            embed: CherryCola.HTMLAttributes<JSX_DOM.EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
            fieldset: CherryCola.HTMLAttributes<JSX_DOM.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
            figcaption: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            figure: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            footer: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            form: CherryCola.HTMLAttributes<JSX_DOM.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
            h1: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h2: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h3: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h4: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h5: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            h6: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
            head: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
            header: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            hgroup: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            hr: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
            html: CherryCola.HTMLAttributes<JSX_DOM.HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
            i: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            iframe: CherryCola.HTMLAttributes<JSX_DOM.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
            img: CherryCola.HTMLAttributes<JSX_DOM.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
            input: CherryCola.HTMLAttributes<JSX_DOM.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
            ins: CherryCola.HTMLAttributes<JSX_DOM.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
            kbd: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            keygen: CherryCola.HTMLAttributes<JSX_DOM.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
            label: CherryCola.HTMLAttributes<JSX_DOM.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
            legend: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
            li: CherryCola.HTMLAttributes<JSX_DOM.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
            link: CherryCola.HTMLAttributes<JSX_DOM.LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
            main: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            map: CherryCola.HTMLAttributes<JSX_DOM.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
            mark: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            menu: CherryCola.HTMLAttributes<JSX_DOM.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
            menuitem: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            meta: CherryCola.HTMLAttributes<JSX_DOM.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
            meter: CherryCola.HTMLAttributes<JSX_DOM.MeterHTMLAttributes<HTMLElement>, HTMLElement>;
            nav: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            noindex: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            noscript: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            object: CherryCola.HTMLAttributes<JSX_DOM.ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
            ol: CherryCola.HTMLAttributes<JSX_DOM.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
            optgroup: CherryCola.HTMLAttributes<JSX_DOM.OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
            option: CherryCola.HTMLAttributes<JSX_DOM.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
            output: CherryCola.HTMLAttributes<JSX_DOM.OutputHTMLAttributes<HTMLElement>, HTMLElement>;
            p: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
            param: CherryCola.HTMLAttributes<JSX_DOM.ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
            picture: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            pre: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
            progress: CherryCola.HTMLAttributes<JSX_DOM.ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
            q: CherryCola.HTMLAttributes<JSX_DOM.QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
            rp: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            rt: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            ruby: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            s: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            samp: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            slot: CherryCola.HTMLAttributes<JSX_DOM.SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
            script: CherryCola.HTMLAttributes<JSX_DOM.ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
            section: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            select: CherryCola.HTMLAttributes<JSX_DOM.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
            small: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            source: CherryCola.HTMLAttributes<JSX_DOM.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
            span: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
            strong: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            style: CherryCola.HTMLAttributes<JSX_DOM.StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
            sub: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            summary: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            sup: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            table: CherryCola.HTMLAttributes<JSX_DOM.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
            template: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
            tbody: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
            td: CherryCola.HTMLAttributes<JSX_DOM.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
            textarea: CherryCola.HTMLAttributes<JSX_DOM.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
            tfoot: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
            th: CherryCola.HTMLAttributes<JSX_DOM.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
            thead: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
            time: CherryCola.HTMLAttributes<JSX_DOM.TimeHTMLAttributes<HTMLElement>, HTMLElement>;
            title: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
            tr: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
            track: CherryCola.HTMLAttributes<JSX_DOM.TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
            u: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            ul: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
            "var": CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            video: CherryCola.HTMLAttributes<JSX_DOM.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
            wbr: CherryCola.HTMLAttributes<JSX_DOM.HTMLAttributes<HTMLElement>, HTMLElement>;
            // webview: CherryCola.HTMLAttributes<JSX_DOM.WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;

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
