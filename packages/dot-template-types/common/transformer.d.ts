export declare const transformer: {
    /**
     * hello-world  =>  helloWorld
     */
    camel(str: string): string;
    /**
     * hello-world  => HelloWorld
     */
    capitalize(str: string): string;
    /**
     * hello-world  =>  HELLO_WORLD
     */
    upper(str: string): string;
    /**
     * hello-world  =>  hello_world
     */
    snake(str: string): string;
};
