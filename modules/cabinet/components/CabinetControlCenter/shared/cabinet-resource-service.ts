var audio : any;

export const cabinetResourceService = {
    setCabinetBuzzer,
    getCabinetBuzzer
}

function setCabinetBuzzer(blobUrl: string) {
    audio = new Audio(
        blobUrl
    );
}

function getCabinetBuzzer() {
    return audio;
}


// WEBPACK FOOTER //
// ./src/modules/cabinet/components/CabinetControlCenter/shared/cabinet-resource-service.ts