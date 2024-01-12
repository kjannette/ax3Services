import {
  AlignmentType,
  Document,
  convertInchesToTwip,
  Packer,
  Paragraph,
  Styles,
  Style,
  SectionType,
  TextRun,
  UnderlineType,
  Underline,
  LineRuleType,
} from "docx";

export const newYorkStyleTemplate = {
  styles: {
    paragraphStyles: [
      {
        id: "captionIndent",
        name: "Caption Indent",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          indent: {
            left: convertInchesToTwip(1.5),
            hanging: convertInchesToTwip(0.18),
          },
        },
      },
      {
        id: "headingIndent",
        name: "Heading Indent",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          indent: {
            left: convertInchesToTwip(2.1),
            hanging: convertInchesToTwip(0.18),
          },
          spacing: {
            before: 340,
            after: 340,
          },
        },
      },
      {
        id: "indexIndent",
        name: "indexIndent",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          indent: {
            left: convertInchesToTwip(4),
            hanging: convertInchesToTwip(0.18),
          },
        },
      },
      {
        id: "normalIndent",
        name: "Normal Indent",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          indent: {
            left: convertInchesToTwip(0),
            hanging: convertInchesToTwip(0.18),
          },
        },
      },
      {
        id: "normalIndentSpacingAfter",
        name: "normalIndentSpacingAfter",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          indent: {
            left: convertInchesToTwip(0),
            hanging: convertInchesToTwip(0.18),
          },
          spacing: {
            after: 240,
          },
        },
      },
      {
        id: "normalIndentMoreSpacingAfter",
        name: "normalIndentSpacingAfter",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          indent: {
            left: convertInchesToTwip(0),
            hanging: convertInchesToTwip(0.18),
          },
          spacing: {
            after: 310,
          },
        },
      },
      {
        id: "normalIndentMostSpacingAfter",
        name: "normalIndentSpacingAfter",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          indent: {
            left: convertInchesToTwip(0),
            hanging: convertInchesToTwip(0.18),
          },
          spacing: {
            after: 340,
          },
        },
      },
      {
        id: "verticalSpacing",
        name: "Vertical Spacing",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          spacing: {
            after: 220,
          },
        },
      },
      {
        id: "reset",
        name: "reset",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          indent: {
            left: convertInchesToTwip(0),
            hanging: convertInchesToTwip(0),
          },
          spacing: {
            after: 0,
          },
        },
      },
      {
        id: "doubleSpacedText",
        name: "Double Spaced Text",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          spacing: {
            before: 10 * 72 * 0.1,
            after: 10 * 72 * 0.01,
            lineRule: LineRuleType.AT_LEAST,
            line: 2,
          },
          alignment: AlignmentType.JUSTIFIED,
        },
      },
      {
        id: "secondHeaderRun",
        name: "Second Header Run",
        basedOn: "Normal",
        next: "Normal",
        paragraph: {
          spacing: {
            before: 10 * 72 * 0.3,
            after: 10 * 72 * 0.3,
            lineRule: LineRuleType.EXACTLY,
            line: 276,
          },
        },
      },
    ],
  },

  sections: [],
};
