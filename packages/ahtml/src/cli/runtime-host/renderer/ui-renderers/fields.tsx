import React from "react"

void React

import { resolveElement } from "../elements"
import type { RendererKind } from "../kinds"
import { applyPropMappings, getRendererPropMappings } from "../renderer-props"
import type {
  AgentComponentNode,
  RendererPath,
  RendererSpecComponent,
} from "../types"
import type { UiRenderer, UiRendererContext } from "../ui-renderer-types"
import {
  createFieldSemantics,
  getFieldControlProps,
  getFieldDescriptionProps,
  getFieldLabelProps,
} from "./helpers/field-semantics"
import { renderNoScriptFieldControlFallback } from "./helpers/fallbacks"
import { requireRendererSpecField } from "./helpers/structured-items"

export function createFieldUiRenderers(context: UiRendererContext) {
  function renderTextFieldComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Label = resolveElement(rendererSpec.label)
    const Control = resolveElement(rendererSpec.control)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const valueProp = rendererSpec.fallback
      ? requireRendererSpecField(rendererSpec, "valueProp")
      : undefined
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const controlProps = {
      ...rendererSpec.staticProps,
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
      ...getFieldControlProps(fieldSemantics),
    }

    return (
      <>
        <Root {...context.getComponentMetadataProps(node, rendererSpec, path)}>
          {label ? (
            <Label
              {...getFieldLabelProps(fieldSemantics, true)}
              className={rendererSpec.labelClassName}
            >
              {label}
            </Label>
          ) : null}
          <Control {...controlProps} />
          {description && Description ? (
            <Description
              {...getFieldDescriptionProps(fieldSemantics)}
              className={rendererSpec.descriptionClassName}
            >
              {description}
            </Description>
          ) : null}
        </Root>
        {rendererSpec.fallback && valueProp
          ? renderNoScriptFieldControlFallback({
              description,
              label,
              value: node.props[valueProp],
            })
          : null}
      </>
    )
  }

  function renderToggleFieldComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const FieldContent = resolveElement("FieldContent")
    const Label = resolveElement(rendererSpec.label)
    const Control = resolveElement(rendererSpec.control)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const controlProps = {
      ...rendererSpec.staticProps,
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
      ...getFieldControlProps(fieldSemantics),
    }

    return (
      <Root
        {...context.getComponentMetadataProps(node, rendererSpec, path)}
        orientation="horizontal"
      >
        <Control {...controlProps} />
        <FieldContent>
          {label ? (
            <Label
              {...getFieldLabelProps(fieldSemantics, true)}
              className={rendererSpec.labelClassName}
            >
              {label}
            </Label>
          ) : null}
          {description && Description ? (
            <Description
              {...getFieldDescriptionProps(fieldSemantics)}
              className={rendererSpec.descriptionClassName}
            >
              {description}
            </Description>
          ) : null}
        </FieldContent>
      </Root>
    )
  }

  function renderRangeFieldComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    return renderTextFieldComponent(node, rendererSpec, path)
  }

  function renderSliderFieldComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Label = resolveElement(rendererSpec.label)
    const Control = resolveElement(rendererSpec.control)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const valueProp = requireRendererSpecField(rendererSpec, "valueProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const controlProps = {
      ...rendererSpec.staticProps,
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
      controlId: fieldSemantics.controlId,
      labelId: fieldSemantics.labelId,
      descriptionId: fieldSemantics.descriptionId,
    }

    return (
      <>
        <Root {...context.getComponentMetadataProps(node, rendererSpec, path)}>
          {label ? (
            <Label
              {...getFieldLabelProps(fieldSemantics, false)}
              className={rendererSpec.labelClassName}
            >
              {label}
            </Label>
          ) : null}
          <Control {...controlProps} />
          {description && Description ? (
            <Description
              {...getFieldDescriptionProps(fieldSemantics)}
              className={rendererSpec.descriptionClassName}
            >
              {description}
            </Description>
          ) : null}
        </Root>
        {rendererSpec.fallback
          ? renderNoScriptFieldControlFallback({
              description,
              label,
              value: node.props[valueProp],
            })
          : null}
      </>
    )
  }

  return {
    "text-field": renderTextFieldComponent,
    "toggle-field": renderToggleFieldComponent,
    "range-field": renderRangeFieldComponent,
    "slider-field": renderSliderFieldComponent,
  } satisfies Partial<Record<RendererKind, UiRenderer>>
}
