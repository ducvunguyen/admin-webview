export const LIST_STATUS = [
    {name: 'Kích Hoạt', value: 'ACTIVE'},
    {name: 'Huỷ Kích Hoạt', value: 'DEACTIVE'},
    {name: 'Chờ Duyệt', value: 'PENDING'},
    {name: 'Vô Hiệu Hoá', value: 'DISABLE'},
];

export const LIST_STATUS_OFFER = [
    {name: 'Kích Hoạt', value: 'ACTIVE'},
    {name: 'Huỷ Kích Hoạt', value: 'DEACTIVE'},
    {name: 'Chờ Duyệt', value: 'PENDING'},
    {name: 'Vô Hiệu Hoá', value: 'DISABLE'},
    {name: 'Leader đã duyệt', value: 'LEADER_APPROVED'},
];

//regex form
// export const REGEX_PHONE = /^(((0|0084|\+84)(3[2|3|4|5|6|7|8|9]|5[6|8|9]|7[0|6|7|8|9]|8[1|2|3|4|5|6|7|8|9]|9[0|1|2|3|4|6|7|8|9])([0-9]{7})|((1900|1800)([0-9]{4}))|((1900|1800)([0-9]{6}))|((02)([0-9]{9}))))$/;
export const REGEX_PHONE = /^[0-9]{3,11}$/g;
export const REGEX_NUMBER = /^[0-9]*$/g;
export const REGEX_LINK = /(https?:\/\/[^\s]+)/g;
//regex form

//permission
export const ACTIVE_OFFER = 'ACTIVE_OFFER';
export const MB_ADMIN = 'MB_ADMIN';
export const USER_MANAGEMENT = 'USER_MANAGEMENT';
export const ORGANIZE_OFFER = 'ORGANIZE_OFFER';
export const LEADER_APPROVAL = 'LEADER_APPROVAL';
//permission


export const FILTER_WHITE = 'brightness(0) saturate(100%) invert(100%) sepia(6%) saturate(0%) hue-rotate(120deg) brightness(108%) contrast(108%)';

export const TOOL_BAR = {
    toolbar :[
        "heading",
        "|",
        "bold",
        "italic",
        "link",
        "bulletedList",
        "numberedList",
        "|",
        "outdent",
        "indent",
        "|",
        "blockQuote",
        "undo",
        "redo"
    ]
};

export const DEFAULT_OBJECT_FILE = {
    file: null,
    url: null,
    isValidate: false,
};

export const LIST_STATUS_TASK = {
    'DONE': {
        bgColor: '#28a745',
        textColor: 'white'
    },
    'OPEN': {
        bgColor: '#0d6efd',
        textColor: 'white'
    },
    'PENDING': {
        bgColor: '#ffc107',
        textColor: 'white'
    },
    'PROCESSING': {
        bgColor: '#ffc107',
        textColor: 'white'
    },
    'REOPEN': {
        bgColor: '#0d6efd',
        textColor: 'white'
    },
    'URGENT': {
        bgColor: '#dc3545',
        textColor: 'white'
    }
}

//validate
export const VALIDATE_REQUIRED = {
    required: true,
    message: 'Mục này là bắt buộc',
};

export const VALIDATE_PHONE = {
    pattern: REGEX_PHONE,
    message: 'Số điện thoại không đúng'
};

export const VALIDATE_MAX_LENGTH_200 = {
    max: 200,
    message: 'Không vượt quá 200 ký tự'
};

export const VALIDATE_NUMBER = {
    pattern: REGEX_NUMBER,
    message: 'Không đúng định dạng'
};

export const VALIDATE_LINK = {
    pattern: REGEX_LINK,
    message: 'Không đúng định dạng đường dẫn'
}

export const VALIDATE_EMAIL = {
    type: 'email',
    message: 'Không đúng định dạng đường dẫn'
}
//validate

//TO CHUC PHAT HANH
export const CARD_OFFER = {
    "Visa": {
        "Debit": [
            "Classic",
            "Gold",
            "Platinum"
        ],
        "Credit": [
            "Classic",
            "Gold",
            "Platinum",
            "Priority",
            "Infinite"
        ]
    },
    "JCB": {
        "Debit": [],
        "Credit": [
            "Classic",
            "Gold",
            "Platinum"
        ]
    }
}
