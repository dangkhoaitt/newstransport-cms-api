import * as libphonenumbers from 'google-libphonenumber'

// Create an instance of PhoneNumberUtil
const phoneUtil = libphonenumbers.PhoneNumberUtil.getInstance()

export function isValidPhoneNumber(phoneNumber: string): boolean {
    // Parse number with VN country code and keep raw input
    try {
        const vnRegion = phoneUtil.parseAndKeepRawInput(phoneNumber, 'VN')
        return phoneUtil.isValidNumber(vnRegion)
    } catch (e) {
        return false
    }
}
