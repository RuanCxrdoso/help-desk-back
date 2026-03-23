// src/domain/help-desk/enterprise/entities/value-objects/slug.ts
import { ValueObject } from '@/core/entities/value-object'

interface SlugProps {
  value: string
}

export class Slug extends ValueObject<SlugProps> {
  get value() {
    return this.props.value
  }

  static create(slug: string) {
    return new Slug({ value: slug })
  }

  static createFromText(text: string) {
    const slugText = text
      .normalize('NFKD') // Separa os acentos das letras
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/[^\w-]+/g, '') // Remove tudo que não for palavra ou hífen
      .replace(/_/g, '-') // Troca underlines por hífens
      .replace(/--+/g, '-') // Evita hífens duplos
      .replace(/-$/g, '') // Remove hífen no final da string, se sobrar

    return new Slug({ value: slugText })
  }
}
