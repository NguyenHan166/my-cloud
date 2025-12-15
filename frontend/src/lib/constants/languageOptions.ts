// Language options for Monaco Editor - matches Notion's language list
export interface LanguageOption {
    value: string;
    label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
    // Common/Popular
    { value: 'plaintext', label: 'Plain Text' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'json', label: 'JSON' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'yaml', label: 'YAML' },
    { value: 'xml', label: 'XML' },

    // A-B
    { value: 'abap', label: 'ABAP' },
    { value: 'apex', label: 'Apex' },
    { value: 'azcli', label: 'Azure CLI' },
    { value: 'bat', label: 'Batch' },

    // C
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'clojure', label: 'Clojure' },
    { value: 'coffeescript', label: 'CoffeeScript' },

    // D-F
    { value: 'dart', label: 'Dart' },
    { value: 'dockerfile', label: 'Dockerfile' },
    { value: 'fsharp', label: 'F#' },

    // G-H
    { value: 'go', label: 'Go' },
    { value: 'graphql', label: 'GraphQL' },
    { value: 'groovy', label: 'Groovy' },
    { value: 'handlebars', label: 'Handlebars' },
    { value: 'hcl', label: 'HCL' },

    // I-J
    { value: 'ini', label: 'INI' },
    { value: 'java', label: 'Java' },
    { value: 'julia', label: 'Julia' },

    // K-L
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'latex', label: 'LaTeX' },
    { value: 'less', label: 'Less' },
    { value: 'lua', label: 'Lua' },

    // M
    { value: 'makefile', label: 'Makefile' },
    { value: 'mips', label: 'MIPS' },
    { value: 'msdax', label: 'DAX' },
    { value: 'mysql', label: 'MySQL' },

    // O-P
    { value: 'objective-c', label: 'Objective-C' },
    { value: 'pascal', label: 'Pascal' },
    { value: 'perl', label: 'Perl' },
    { value: 'pgsql', label: 'PostgreSQL' },
    { value: 'php', label: 'PHP' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'pug', label: 'Pug' },

    // R
    { value: 'r', label: 'R' },
    { value: 'razor', label: 'Razor' },
    { value: 'redis', label: 'Redis' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'rust', label: 'Rust' },

    // S
    { value: 'sass', label: 'Sass' },
    { value: 'scala', label: 'Scala' },
    { value: 'scheme', label: 'Scheme' },
    { value: 'scss', label: 'SCSS' },
    { value: 'shell', label: 'Shell/Bash' },
    { value: 'solidity', label: 'Solidity' },
    { value: 'swift', label: 'Swift' },

    // T
    { value: 'tcl', label: 'Tcl' },
    { value: 'toml', label: 'TOML' },
    { value: 'twig', label: 'Twig' },

    // V-W
    { value: 'vb', label: 'Visual Basic' },
    { value: 'verilog', label: 'Verilog' },
    { value: 'vhdl', label: 'VHDL' },

    // X-Z
    { value: 'wasm', label: 'WebAssembly' },
];

// Get language label by value
export function getLanguageLabel(value: string): string {
    const option = LANGUAGE_OPTIONS.find((opt) => opt.value === value);
    return option?.label || value;
}

// Popular languages for quick access
export const POPULAR_LANGUAGES = [
    'plaintext',
    'markdown',
    'json',
    'javascript',
    'typescript',
    'python',
    'html',
    'css',
    'sql',
];
