import { Alert, AlertContent, AlertTitle, AlertDescription } from "./alert"
import { Button } from "./button"
import { TriangleAlert, X } from "lucide-react"

function AlertWithDescription() {
  return (
    <Alert
      className="min-w-[400px]"
      layout="complex"
      isNotification
      size="lg"
      icon={
        <TriangleAlert className="text-amber-500" size={16} strokeWidth={2} />
      }
      action={
        <Button
          variant="ghost"
          className="group -my-1.5 -me-2 size-8 p-0 hover:bg-transparent"
          aria-label="Close notification"
        >
          <X
            size={16}
            strokeWidth={2}
            className="opacity-60 transition-opacity group-hover:opacity-100"
          />
        </Button>
      }
    >
      <AlertContent>
        <AlertTitle>Something requires your action!</AlertTitle>
        <AlertDescription>
          It conveys that a specific action is needed to resolve or address a situation.
        </AlertDescription>
        <div className="pt-3">
          <Button size="sm">Learn more</Button>
        </div>
      </AlertContent>
    </Alert>
  )
}

export { AlertWithDescription }