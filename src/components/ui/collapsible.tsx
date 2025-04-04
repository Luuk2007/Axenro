
import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

interface CollapsibleProps extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  defaultOpen?: boolean;
}

const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  CollapsibleProps
>(({ defaultOpen, ...props }, ref) => (
  <CollapsiblePrimitive.Root defaultOpen={defaultOpen} {...props} ref={ref} />
));
Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
