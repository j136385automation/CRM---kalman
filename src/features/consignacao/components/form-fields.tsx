'use client';

import { useEffect, useId, useState } from 'react';
import { useStore } from '@tanstack/react-form';
import {
  createFormField,
  FormField,
  FormFieldError,
  FormFieldSet,
  useFieldContext
} from '@/components/ui/tanstack-form';
import { Input } from '@/components/ui/input';
import { FieldDescription, FieldLabel } from '@/components/ui/field';
import type { NegociacaoInput } from '../api/types';

export type NegociacaoFormValues = {
  [Key in keyof NegociacaoInput]: NegociacaoInput[Key];
};

interface ScaledNumberFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  max?: number;
  unit?: 'BRL' | 'percent';
}

/** Display reais/percentages while keeping integer cents/basis points in form state. */
function ScaledNumberField({
  label,
  description,
  required,
  disabled,
  max,
  unit = 'BRL'
}: ScaledNumberFieldProps) {
  const field = useFieldContext();
  const inputId = useId();
  const value = useStore(field.store, (state) => state.value) as number;
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value ? String(value / 100) : '');

  useEffect(() => {
    if (!editing) setText(value ? String(value / 100) : '');
  }, [value, editing]);

  return (
    <FormFieldSet>
      <FormField>
        <FieldLabel htmlFor={inputId}>
          {`${label} (${unit === 'BRL' ? 'R$' : '%'})${required ? ' *' : ''}`}
        </FieldLabel>
        <Input
          id={inputId}
          type='number'
          inputMode='decimal'
          min={0}
          max={max}
          step={0.01}
          placeholder='0,00'
          disabled={disabled}
          value={text}
          onFocus={() => setEditing(true)}
          onBlur={() => {
            setEditing(false);
            field.handleBlur();
          }}
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            field.handleChange(next === '' ? 0 : Math.round(Number(next) * 100));
          }}
          aria-invalid={field.errors.length > 0}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </FormField>
      <FormFieldError />
    </FormFieldSet>
  );
}

interface DateFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

function DateField({ label, description, required, disabled }: DateFieldProps) {
  const field = useFieldContext();
  const inputId = useId();
  const value = useStore(field.store, (state) => state.value) as string;

  return (
    <FormFieldSet>
      <FormField>
        <FieldLabel htmlFor={inputId}>{`${label}${required ? ' *' : ''}`}</FieldLabel>
        <Input
          id={inputId}
          type='date'
          value={value || ''}
          disabled={disabled}
          onChange={(event) => field.handleChange(event.target.value)}
          onBlur={field.handleBlur}
          aria-invalid={field.errors.length > 0}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
      </FormField>
      <FormFieldError />
    </FormFieldSet>
  );
}

export const FormMoneyField = createFormField(ScaledNumberField);
export const FormDateField = createFormField(DateField);

export function mensagemErro(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
}

export function dataHojeBrasil(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}
