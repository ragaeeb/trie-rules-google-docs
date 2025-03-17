export interface ContentElement {
    paragraph?: Paragraph;
}

export interface Document {
    id: string;
    name: string;
}

export interface FullDocument extends Document {
    body?: {
        content?: ContentElement[];
    };
    footnotes?: Record<string, Footnote>;
}

interface Footnote {
    content?: ContentElement[];
}

interface Paragraph {
    elements: ParagraphElement[];
}

interface ParagraphElement {
    textRun?: TextRun;
}

interface TextRun {
    content: string;
    textStyle: {
        link?: {
            url: string;
        };
    };
}
