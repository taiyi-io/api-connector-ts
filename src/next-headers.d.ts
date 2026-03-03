/**
 * 为可选 peer 依赖 next/headers 提供最小类型声明
 * 当消费者的项目中安装了 next 时，此声明会被真正的 next 类型覆盖
 */
declare module "next/headers" {
  interface ResponseCookie {
    name: string;
    value: string;
    httpOnly?: boolean;
    maxAge?: number;
    sameSite?: "strict" | "lax" | "none";
    path?: string;
    secure?: boolean;
  }

  interface ReadonlyRequestCookies {
    get(name: string): { name: string; value: string } | undefined;
    set(
      name: string,
      value: string,
      options?: Partial<ResponseCookie>
    ): ReadonlyRequestCookies;
  }

  export function cookies(): Promise<ReadonlyRequestCookies>;
}
