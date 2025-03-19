"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { data } from "@/components/ui/administrateur/app-sidebar"; // Import data from AppSidebar

type BreadcrumbItemType = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  separator?: React.ReactNode;
};

export function Breadcrumb({ separator = "/" }: BreadcrumbProps) {
  const pathname = usePathname();

  const generateBreadcrumbItems = (): BreadcrumbItemType[] => {
    const items: BreadcrumbItemType[] = [{ label: "Home", href: "/" }];

    // Check top-level items
    const matchedMainItem = data.navMain.find((mainItem) => mainItem.url === pathname);
    if (matchedMainItem) {
      items.push({ label: matchedMainItem.title, href: matchedMainItem.url });
    } else {
      // Check sub-items
      data.navMain.forEach((mainItem) => {
        const matchedSubItem = mainItem.items.find((subItem) => subItem.url === pathname);
        if (matchedSubItem) {
          items.push({ label: mainItem.title, href: mainItem.url });
          items.push({ label: matchedSubItem.title, href: matchedSubItem.url });
        }
      });
    }

    // Set the last item to have no href (current page)
    if (items.length > 1) {
      items[items.length - 1] = { label: items[items.length - 1].label };
    }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbItems();

  return (
    <ShadcnBreadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem className={index > 0 ? "hidden md:block" : ""}>
              {item.href ? (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator className="hidden md:block">
                {separator}
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}