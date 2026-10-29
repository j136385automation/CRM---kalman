'use client';

import { useFormFields } from '@/components/ui/tanstack-form';
import type { NegociacaoFormValues } from './form-fields';

interface PessoaFieldsProps {
  prefix: 'loja' | 'vendedor' | 'comprador';
  disabled?: boolean;
}

export default function PessoaFields({ prefix, disabled }: PessoaFieldsProps) {
  const { FormTextField } = useFormFields<NegociacaoFormValues>();

  return (
    <fieldset disabled={disabled} className='grid gap-4 sm:grid-cols-2'>
      <FormTextField
        name={`${prefix}.nome`}
        label='Nome completo / razão social'
        placeholder='Conforme o documento de identificação'
        maxLength={180}
      />
      <FormTextField
        name={`${prefix}.documento`}
        label='CPF / CNPJ'
        placeholder='Informe o documento da parte'
        maxLength={18}
      />
      <FormTextField
        name={`${prefix}.representante`}
        label='Representante e poderes de representação'
        placeholder='Nome, CPF, cargo e referência da procuração ou contrato social'
        description='Preencha quando alguém assinar em nome da parte.'
        maxLength={500}
      />
      <FormTextField
        name={`${prefix}.endereco`}
        label='Endereço completo'
        placeholder='Rua, número, complemento, bairro e CEP'
        maxLength={300}
      />
      <FormTextField name={`${prefix}.cidade`} label='Cidade' maxLength={100} />
      <FormTextField
        name={`${prefix}.uf`}
        label='UF'
        placeholder='Ex.: SP'
        maxLength={2}
        listeners={{
          onBlur: ({ value, fieldApi }) => {
            if (typeof value === 'string') fieldApi.handleChange(value.toUpperCase());
          }
        }}
      />
      <FormTextField name={`${prefix}.email`} label='E-mail' type='email' maxLength={200} />
      <FormTextField
        name={`${prefix}.telefone`}
        label='Telefone'
        type='tel'
        placeholder='DDD e número'
        maxLength={30}
      />
    </fieldset>
  );
}
