/// <reference types="vite/client" />

// Less 模块声明
declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Turndown 模块声明
declare module 'turndown' {
  interface TurndownServiceOptions {
    headingStyle?: 'atx' | 'setext';
    codeBlockStyle?: 'fenced' | 'indented';
    bulletListMarker?: '-' | '*' | '+';
    emphasis?: '_' | '*';
    strong?: '**' | '__';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
  }

  class TurndownService {
    constructor(options?: TurndownServiceOptions);
    turndown(html: string): string;
    addRule(key: string, rule: object): TurndownService;
    use(plugin: Function): TurndownService;
  }

  export = TurndownService;
}