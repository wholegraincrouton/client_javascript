import { SearchCriteriaBase} from "../../shared/types/dto";
import * as constants from "../constants/user-image.constants";

export interface UserSearchCriteria extends SearchCriteriaBase {
    name: string;
    role: string;
    email: string;
    mobileNumber: string;    
}

export interface User {
    id: string;
    externalSystemId?: string;
    company?: string;
    culture?: string;
    timeZone?: string;
    timeZoneOffsetInMinutes?: number;
    firstName?: string;
    lastName?: string;
    designation?: string;
    description?: string;
    mobileNumber?: string;
    email?: string;
    isEmailConfirmed?: boolean;
    isActivationEmailSent?: boolean;
    hasProfileImage?: boolean;
    profileImageURL?: string;
    tempProfileImageURL?: string;
    alternateId?: string;
    accessExpiryDate?: string;
    isDeleted?: boolean;
    updatedByName?: string;
    updatedOnUtc?: Date;
    isTwoFactorAuthEnabled?: boolean;
    eTag?: string;
    pin?: string;
    customerRoles?: UserCustomerRole[];
    biometricData?: BiometricData[];
    customerCabinets?: CustomerCabinets[];
    userFieldsInExternalMapping?: string[];
}

export interface CustomerCabinets{
    customerId: string;
    cabinetList: string[];
}

export interface BiometricData {
    id: string;
    enrolmentSource?: string;
    identityType?: string;
    binaryData?: string;
    hexData?: string;
    extenalSystemCardId?: string;
    maskedBinaryData?: string;
    facilityCode?: string;
    cardId?: string;
    issueCode?: string;
}

export interface UserCustomerRole {
    customerId: string;
    role: string;
}

export interface AccessibleItem {
    itemNumber: number;
    cabinetName: string;
    accessGroupName: string;
    accessStartsOn: string;
    accessEndsOn: string;
    scheduleList: string;
    scheduleStartTime: string;
    scheduleEndTime: string;
}

export class UserProfileImageConstants {
    static readonly DefaultImagePath = "/images/defaultUserImage.png";
}

export interface UserAvatarAction {
    type: constants.CHANGE_USER_AVATAR;
    hasImage: boolean;
    imageURL: string;
}

export class CardDataConst {
    static readonly WEB_ENROLMENT_SOURCE = "WEB";
    static readonly CABINET_ENROLMENT_SOURCE = "CABINET";
    static readonly EXCHANGE_ENROLMENT_SOURCE = "EXCHANGE";
}

export enum UserFields {
    FirstName = "FirstName",
    LastName = "LastName",
    Designation = "Designation",
    Description = "Description",
    Company = "Company",
    MobileNumber = "MobileNumber",
    Email = "Email",
    AlternateId = "AlternateId",
    TimeZone = "TimeZone",
    Culture = "Culture",
    AccessExpiryDate = "AccessExpiryDate",
    PIN = "PIN",
    Cards = "Cards",
    UserGroups = "UserGroups",
    UserStatus = "UserStatus"
}

export class UserAccessRequestResult {
    isGranted: boolean;
    errorCode: string;
    lastAccessRequestActionUser: string;
    lastAccessRequestGranted: boolean;
    accessRequestUser: string;
}



// WEBPACK FOOTER //
// ./src/modules/users/types/dto.ts