"use client"

import * as React from "react"
import {
  getAllProvinces,
  getMunicipalitiesByProvince,
} from "@aivangogh/ph-address"
import { City, Country, State } from "country-state-city"

import { Field } from "@/components/form-field"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

const INDUSTRIES = [
  "Agriculture",
  "Automotive",
  "Banking & Finance",
  "Construction",
  "Consulting",
  "Education",
  "Energy & Utilities",
  "Fashion & Apparel",
  "Food & Beverage",
  "Government",
  "Healthcare",
  "Hospitality & Tourism",
  "Information Technology",
  "Insurance",
  "Logistics & Transport",
  "Manufacturing",
  "Media & Entertainment",
  "Mining",
  "Non-Profit",
  "Pharmaceuticals",
  "Real Estate",
  "Retail",
  "Telecommunications",
  "Wholesale & Distribution",
]

export function AutocompleteField({
  kind,
  label,
  value,
  country,
  region,
  disabled,
  onChange,
}: {
  kind: "country" | "region" | "city" | "industry"
  label: string
  value: string
  country?: string
  region?: string
  disabled?: boolean
  onChange: (value: string) => void
}) {
  const id = `autocomplete-${kind}`

  const options = React.useMemo(() => {
    if (kind === "industry") return INDUSTRIES
    if (kind === "country") return Country.getAllCountries().map((item) => item.name)

    const isPhilippines = (country ?? "").toLowerCase() === "philippines"
    if (isPhilippines) {
      const provinces = getAllProvinces()
      if (kind === "region") return provinces.map((item) => item.name)
      const province = provinces.find(
        (item) => item.name.toLowerCase() === (region ?? "").toLowerCase()
      )
      return province
        ? getMunicipalitiesByProvince(province.psgcCode).map((item) => item.name)
        : []
    }

    const selectedCountry = Country.getAllCountries().find(
      (item) => item.name === country
    )
    if (!selectedCountry) return []

    if (kind === "region") {
      return State.getStatesOfCountry(selectedCountry.isoCode).map((item) => item.name)
    }

    const selectedState = State.getStatesOfCountry(selectedCountry.isoCode).find(
      (item) => item.name === region
    )
    const cities = selectedState
      ? City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode)
      : (City.getCitiesOfCountry(selectedCountry.isoCode) ?? [])
    return cities.map((item) => item.name)
  }, [kind, country, region])

  return (
    <Field id={id} label={label}>
      <Combobox
        items={options}
        value={value || null}
        onValueChange={(next) => onChange(next ?? "")}
        disabled={disabled}
      >
        <ComboboxInput
          id={id}
          placeholder={`Search ${label.toLowerCase()}...`}
          className="h-8 w-full text-xs"
        />
        <ComboboxContent className="w-(--anchor-width)">
          <ComboboxEmpty>No matches found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}
