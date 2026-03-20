import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { GlassCard } from '../ui'
import { PLATFORMS } from '../../lib/constants'
import type { Account } from '../../types'

const vaSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  accounts: z.array(z.object({
    name: z.string().min(1, 'Le nom du compte est requis'),
    platform: z.string().min(1, 'La plateforme est requise'),
  })).min(1, 'Au moins un compte requis').max(3, 'Maximum 3 comptes')
})

type VAFormData = z.infer<typeof vaSchema>

interface VAFormProps {
  onSubmit: (data: VAFormData) => void
  defaultValues?: Partial<VAFormData>
}

export function VAForm({ onSubmit, defaultValues }: VAFormProps) {
  const [accounts, setAccounts] = useState<Array<{name: string; platform: string}>>(
    defaultValues?.accounts || [{ name: '', platform: '' }]
  )
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<VAFormData>({
    resolver: zodResolver(vaSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      accounts: defaultValues?.accounts || [{ name: '', platform: '' }]
    }
  })
  
  const addAccount = () => {
    if (accounts.length < 3) {
      setAccounts([...accounts, { name: '', platform: '' }])
    }
  }
  
  const removeAccount = (index: number) => {
    if (accounts.length > 1) {
      setAccounts(accounts.filter((_, i) => i !== index))
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Nom de l'assistant</label>
        <input
          {...register('name')}
          className="glass-input"
          placeholder="Ex: Sophie M."
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium">Comptes</label>
          <button
            type="button"
            onClick={addAccount}
            disabled={accounts.length >= 3}
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
        
        <div className="space-y-3">
          {accounts.map((_, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <input
                    {...register(`accounts.${index}.name`)}
                    className="glass-input"
                    placeholder="Nom du compte (Ex: Compte A)"
                  />
                  {errors.accounts?.[index]?.name && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.accounts[index]?.name?.message}
                    </p>
                  )}
                </div>
                <div>
                  <select
                    {...register(`accounts.${index}.platform`)}
                    className="glass-input"
                  >
                    <option value="">Plateforme</option>
                    {PLATFORMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeAccount(index)}
                disabled={accounts.length <= 1}
                className="p-3 text-white/40 hover:text-red-400 transition-colors disabled:opacity-30"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        {errors.accounts && (
          <p className="text-red-400 text-sm mt-2">{errors.accounts.message || errors.accounts.root?.message}</p>
        )}
      </div>
      
      <button type="submit" className="glass-button w-full">
        Sauvegarder
      </button>
    </form>
  )
}
