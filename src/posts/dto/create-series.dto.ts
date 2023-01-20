interface Posts {
  module: number;
  post: string;
}

export class CreateSeriesDto {
  user: string;
  posts: Posts[];
}
