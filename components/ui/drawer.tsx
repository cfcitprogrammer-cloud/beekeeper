"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Drawer({
  swipeDirection = "right",
  ...props
}: DrawerPrimitive.Root.Props & {
  swipeDirection?: "up" | "down" | "left" | "right"
}) {
  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      swipeDirection={swipeDirection}
      {...props}
    />
  )
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 text-xs/relaxed transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className,
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  swipeDirection = "right",
  showCloseButton = true,
  ...props
}: DrawerPrimitive.Popup.Props & {
  swipeDirection?: "up" | "down" | "left" | "right"
  showCloseButton?: boolean
}) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport className="fixed inset-0 z-50">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          data-swipe-direction={swipeDirection}
          className={cn(
            "fixed z-50 flex flex-col bg-popover bg-clip-padding text-xs/relaxed text-popover-foreground shadow-lg transition duration-200 ease-in-out",
            "inset-y-0 right-0 h-full w-3/4 border-l data-ending-style:translate-x-[2.5rem] data-starting-style:translate-x-[2.5rem] data-[swipe-direction=left]:right-auto data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:border-l-0 data-[swipe-direction=left]:border-r data-[swipe-direction=left]:data-ending-style:translate-x-[-2.5rem] data-[swipe-direction=left]:data-starting-style:translate-x-[-2.5rem]",
            className,
          )}
          {...props}
        >
          <DrawerPrimitive.Content className="flex min-h-0 flex-1 flex-col">
            {children}
          </DrawerPrimitive.Content>
          {showCloseButton ? (
            <DrawerPrimitive.Close
              data-slot="drawer-close"
              render={
                <Button
                  variant="ghost"
                  className="absolute top-3 right-3"
                  size="icon-sm"
                />
              }
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DrawerPrimitive.Close>
          ) : null}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-heading text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
