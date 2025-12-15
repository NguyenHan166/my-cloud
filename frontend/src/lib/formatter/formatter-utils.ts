/**
 * Code formatting utilities using various libraries
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as prettier from "prettier";
import * as prettierBabel from "prettier/plugins/babel";
import * as prettierEstree from "prettier/plugins/estree";
import * as prettierHtml from "prettier/plugins/html";
import * as prettierCss from "prettier/plugins/postcss";
import * as prettierMarkdown from "prettier/plugins/markdown";
import * as prettierGraphql from "prettier/plugins/graphql";
import * as prettierYaml from "prettier/plugins/yaml";
import { format as sqlFormat } from "sql-formatter";
import xmlFormat from "xml-formatter";

export type FormatType =
    | "json"
    | "javascript"
    | "typescript"
    | "html"
    | "css"
    | "scss"
    | "sql"
    | "xml"
    | "yaml"
    | "markdown"
    | "graphql";

export interface FormatOptions {
    tabWidth?: number;
    useTabs?: boolean;
    singleQuote?: boolean;
    semi?: boolean;
}

const DEFAULT_OPTIONS: FormatOptions = {
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    semi: true,
};

/**
 * Format code based on type
 */
export async function formatCode(
    code: string,
    type: FormatType,
    options: FormatOptions = {}
): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
        switch (type) {
            case "json":
                return formatJson(code, opts);

            case "javascript":
            case "typescript":
                return await prettier.format(code, {
                    parser: type === "typescript" ? "babel-ts" : "babel",
                    plugins: [prettierBabel, prettierEstree] as any,
                    tabWidth: opts.tabWidth,
                    useTabs: opts.useTabs,
                    singleQuote: opts.singleQuote,
                    semi: opts.semi,
                });

            case "html":
                return await prettier.format(code, {
                    parser: "html",
                    plugins: [prettierHtml],
                    tabWidth: opts.tabWidth,
                    useTabs: opts.useTabs,
                });

            case "css":
            case "scss":
                return await prettier.format(code, {
                    parser: type === "scss" ? "scss" : "css",
                    plugins: [prettierCss],
                    tabWidth: opts.tabWidth,
                    useTabs: opts.useTabs,
                    singleQuote: opts.singleQuote,
                });

            case "sql":
                return sqlFormat(code, {
                    language: "sql",
                    tabWidth: opts.tabWidth,
                    useTabs: opts.useTabs,
                    keywordCase: "upper",
                });

            case "xml":
                return xmlFormat(code, {
                    indentation: opts.useTabs
                        ? "\t"
                        : " ".repeat(opts.tabWidth || 2),
                    collapseContent: true,
                });

            case "yaml":
                return await prettier.format(code, {
                    parser: "yaml",
                    plugins: [prettierYaml],
                    tabWidth: opts.tabWidth,
                    useTabs: opts.useTabs,
                });

            case "markdown":
                return await prettier.format(code, {
                    parser: "markdown",
                    plugins: [prettierMarkdown],
                    tabWidth: opts.tabWidth,
                    useTabs: opts.useTabs,
                    proseWrap: "preserve",
                });

            case "graphql":
                return await prettier.format(code, {
                    parser: "graphql",
                    plugins: [prettierGraphql],
                    tabWidth: opts.tabWidth,
                    useTabs: opts.useTabs,
                });

            default:
                throw new Error(`Unsupported format type: ${type}`);
        }
    } catch (error) {
        throw new Error(
            `Format error: ${error instanceof Error ? error.message : "Unknown error"}`
        );
    }
}

/**
 * Format JSON with custom handling
 */
function formatJson(code: string, opts: FormatOptions): string {
    const parsed = JSON.parse(code);
    const indent = opts.useTabs ? "\t" : opts.tabWidth;
    return JSON.stringify(parsed, null, indent);
}

/**
 * Minify code
 */
export function minifyCode(code: string, type: FormatType): string {
    switch (type) {
        case "json":
            return JSON.stringify(JSON.parse(code));
        case "sql":
            return code.replace(/\s+/g, " ").trim();
        case "xml":
        case "html":
            return code.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
        default:
            return code.replace(/\s+/g, " ").trim();
    }
}

/**
 * Format type metadata
 */
export const FORMAT_TYPES: { value: FormatType; label: string; ext: string }[] =
    [
        { value: "json", label: "JSON", ext: ".json" },
        { value: "javascript", label: "JavaScript", ext: ".js" },
        { value: "typescript", label: "TypeScript", ext: ".ts" },
        { value: "html", label: "HTML", ext: ".html" },
        { value: "css", label: "CSS", ext: ".css" },
        { value: "scss", label: "SCSS", ext: ".scss" },
        { value: "sql", label: "SQL", ext: ".sql" },
        { value: "xml", label: "XML", ext: ".xml" },
        { value: "yaml", label: "YAML", ext: ".yaml" },
        { value: "markdown", label: "Markdown", ext: ".md" },
        { value: "graphql", label: "GraphQL", ext: ".graphql" },
    ];
