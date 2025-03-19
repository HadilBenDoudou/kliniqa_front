

import { DateInput, dateInputStyle } from "@/components/ui/calendar-rac";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Button, DateRangePicker, Dialog, Group, Label, Popover } from "react-aria-components";
import  RangeCalendar  from "@/components/ui/datefield-rac";
function Component() {
  return (
    <DateRangePicker className="space-y-2">
      <Label className="text-sm font-medium text-foreground">Date range picker</Label>
      <div className="flex">
        <Group className={cn(dateInputStyle, "pe-9")}>
          <DateInput slot="start" />
          <span aria-hidden="true" className="px-2 text-muted-foreground/70">
            -
          </span>
          <DateInput slot="end" />
        </Group>
        <Button className="z-10 -me-px -ms-9 flex w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70">
          <CalendarIcon size={16} strokeWidth={2} />
        </Button>
      </div>
      <Popover
        className="z-50 rounded-lg border border-border bg-background text-popover-foreground shadow-lg shadow-black/5 outline-none data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2"
        offset={4}
      >
        <Dialog className="max-h-[inherit] overflow-auto p-2">
        </Dialog>
      </Popover>
      <p className="mt-2 text-xs text-muted-foreground" role="region" aria-live="polite">
        Built with{" "}
        <a
          className="underline hover:text-foreground"
          href="https://react-spectrum.adobe.com/react-aria/DateRangePicker.html"
          target="_blank"
          rel="noopener nofollow"
        >
          React Aria
        </a>
      </p>
    </DateRangePicker>
  );
}

export default function CalandriePage() {
  return (
    <div>
      <Component />
    </div>
  );
}