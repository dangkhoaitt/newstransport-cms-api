export class AuthHelper {
    private static authStore: Map<string, string> = new Map()

    static setCurrentAuth(key: string, value: string): void {
        this.authStore.set(key, value)
    }

    static getCurrentAuth(key: string): string {
        return this.authStore.get(key)
    }

    static removeCurrentAuth(key: string): void {
        this.authStore.delete(key)
    }
}
