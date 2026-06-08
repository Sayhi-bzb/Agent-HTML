# Host Design Philosophy

## Operating Frame

The host is not a page. It is the operating frame around artifact work.

Its job is to keep orientation cheap: which artifact is active, which sidebar view is active, what can be changed, where temporary tools appear, and what the host is inspecting. The host should stay calm enough that artifact content remains the work surface.

Formal host UI does not mean heavy UI. It means the same decision produces the same shape every time.

## Sidebar As State

The sidebar is not a bucket for controls. It is a compact state machine.

In the artifacts view, the sidebar helps the user find and switch work. In the gallery view, it becomes a focused editor. The shell may change content, but it should not change personality.

The important continuity is not that every view shows the same controls. The important continuity is that density, rhythm, state treatment, and row behavior remain recognizable.

## Attention Zones

Header, body, and footer are attention zones, not just layout slots.

The header carries orientation and scope. The body carries the current work. The footer carries durable utility, low-frequency actions, or commit-like state. When these roles blur, the sidebar starts to feel like an MVP panel instead of an operating frame.

This is why an artifacts-only body does not need to repeat `Artifacts` as a heading. The view is already clear through the brand, search, theme control, and list content. Repetition spends space without improving orientation.

## Dense Space

Dense layout is not about making things small. It is about preserving scan speed.

A host row has one primary object. Supporting values help comparison, but they must give way before object identity disappears. In host chrome, secondary meta is allowed to truncate first.

Theme token rows exposed this rule clearly. The useful scan path is token label first, then current or nearest value. The value is important, but it is not the identity of the row.

## Shared Chrome

Host adapters exist because feature code teaches future feature code.

If every select, dropdown, command, popover, and sidebar item hand-authors its own row shape, the host stops having a single taste. The adapter layer is where repeated chrome becomes judgment.

The point is not abstraction for its own sake. The point is that a host row, a floating item, a swatch, a selected state, and a compact trigger should feel as if they came from one operating frame.

## Behavior Before Shape

Primitive choice follows behavior, not visual resemblance.

Search is command because it locates across a collection. A theme preset is select because it sets one current value. Settings is dropdown while it contains short utility choices. A token row is popover because it opens a local editor or picker.

Similar-looking rows may share item content. They should not erase the behavior of the primitive underneath.

## Floating Context

Floating surfaces are temporary local context. The sidebar is persistent chrome.

That difference matters visually. Floating surfaces should feel related to the host, but they should not borrow sidebar surface identity. The user should sense when they are inside a temporary picker, command surface, menu, or editor rather than another permanent sidebar section.

## State Language

State is part of taste.

Open, selected, pressed, disabled, dirty, and clean do not mean the same thing. A formal host keeps those meanings stable. The user should not have to learn whether a checkmark, active surface, disabled row, or preview state changed meaning from one control family to another.

Selected state should usually claim surface and foreground contrast before font weight. Disabled state should explain unavailability without looking tappable. Dirty state should point toward consequence, not decoration.

## Archive Gravity

Archive material can remind us of taste, but it cannot donate product shape.

The current host is a Canvas operating frame, not the retired app shell. Borrow compactness, restraint, and operational scanning when they still match the current host. Do not bring back old routes, shell ownership, or app structure as if they were current law.
