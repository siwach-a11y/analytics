import Link from "next/link";
import type { ComponentProps } from "react";

const isStaticDemo = process.env.NEXT_PUBLIC_STATIC_DEMO === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

/** Absolute paths for static export — includes GitHub Pages base path when set. */
function staticHref(href: string): string {
  const normalized =
    href === "/" || href === "" ? "/" : href.endsWith("/") ? href : `${href}/`;
  if (!basePath) return normalized;
  if (normalized === "/") return `${basePath}/`;
  return `${basePath}${normalized}`;
}

export function AppLink({ href, children, className, ...rest }: AppLinkProps) {
  if (isStaticDemo) {
    return (
      <a href={staticHref(href)} className={className} {...(rest as ComponentProps<"a">)}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} {...rest}>
      {children}
    </Link>
  );
}
