import { localise } from "src/modules/shared/services";

export const utilityService = {
  validateNumber,
  validateEmail,
  validateSMS,
  validateMobileNumber,
  isStringEmpty,
  getDistinctStrings,
  getSortedList
};

function validateNumber(value: number) {
  return !value ? localise("ERROR_FIELD_REQUIRED") : undefined;
}

function validateMobileNumber(value: string) {
  return (value && !/^\+?[1-9]\d{1,14}$/.test(value))
    ? localise("ERROR_INVALID_MOBILE_NUMBER_FORMAT") : undefined;
}

function validateEmail(value: string) {
  return value && !/^\s?[A-Z0-9]+[A-Z0-9._+-]{0,}@[A-Z0-9._+-]+\.[A-Z0-9]{2,4}\s?$/i.test(value)
    ? localise("ERROR_INVALID_EMAIL_ADDRESS") : undefined;
}

function validateSMS(value: string) {
  return value && !/^\+?([0-9]{12})$/i.test(value)
    ? localise("ERROR_INVALID_PHONE_NUMBER") : undefined;
}

function isStringEmpty(str: string | undefined) {
  return (str == undefined) || str.trim().length == 0;
}

function getDistinctStrings(list: string[]) {
  const distinct = (value: any, index: any, self: any) => { return self.indexOf(value) === index };
  return list.filter(distinct);
}

function getSortedList(list: any[], field: any, secondaryField?: any) {
  let sortedList = list.sort(function (first, second) {
    let firstValue = typeof first[field] == 'string' ? first[field].toLowerCase() : first[field];
    let secondValue = typeof second[field] == 'string' ? second[field].toLowerCase() : second[field];

    if (firstValue < secondValue) { return -1; }
    if (firstValue > secondValue) { return 1; }

    if (secondaryField) {
      let firstSecondaryValue = typeof first[secondaryField] == 'string' ? first[secondaryField].toLowerCase() : first[secondaryField];
      let secondSecondaryValue = typeof second[secondaryField] == 'string' ? second[secondaryField].toLowerCase() : second[secondaryField];

      if (firstSecondaryValue < secondSecondaryValue) { return -1; }
      if (firstSecondaryValue > secondSecondaryValue) { return 1; }
    }
    return 0;
  });
  return sortedList;
}


// WEBPACK FOOTER //
// ./src/modules/shared/services/util.service.ts