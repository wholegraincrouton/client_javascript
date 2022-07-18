export const uiDomService = {
    adjustDynamicPageContentSizes
}

//This function will adjust page contents so that the fixed area stay fixed at the top
//and the scrollable area resizes to the rest of screen space. 
function adjustDynamicPageContentSizes() {
    const topContent = document.querySelector(".page-fixed-content");

    if (topContent) {

        const fillContent = document.querySelector(".page-fill-content") as HTMLDivElement;
        const dataGrid = document.querySelector(".data-grid-container .k-widget.k-grid") as HTMLDivElement;

        const topContentHeight = topContent ? topContent.clientHeight : 0;
        adjustHeight(fillContent, topContentHeight, 150, 180);
        adjustHeight(dataGrid, topContentHeight, 230, 600);
    }
}

function adjustHeight(elem: HTMLDivElement, topContentHeight: number, offset: number, minHeight: number) {
    if (!elem)
        return;

    let fillHeight = window.innerHeight - topContentHeight - offset;
    if (fillHeight < minHeight) fillHeight = minHeight;
    elem.style.maxHeight = fillHeight + "px";
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/ui-dom.service.ts