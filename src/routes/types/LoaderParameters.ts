type LoaderParameters<Key extends string = string> = {
    readonly [key in Key]: string | undefined;
  };

  export type {LoaderParameters};