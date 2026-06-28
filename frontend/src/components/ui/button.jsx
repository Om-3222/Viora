import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"

import { cn } from "@/lib/utils"
import { buttonVariants } from "./button-variants"

const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  ...props
}, ref) => {
  return (
    <ButtonPrimitive
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button }


