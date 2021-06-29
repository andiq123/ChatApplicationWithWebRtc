export class DescriptionLimiter {
  limit: number;
  descriptionText: string;

  constructor(descriptionText: string, limit: number = 200) {
    this.descriptionText = descriptionText;
    this.limit = limit;
  }

  GetDescription(): string {
    return this.descriptionText.length > this.limit
      ? this.descriptionText.substr(0, this.limit)
      : this.descriptionText;
  }
}
