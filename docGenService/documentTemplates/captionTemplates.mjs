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
} from "docx";

export const newYorkCaptionTemplate = (
  jurisdiction,
  venue,
  plaintiff,
  defendant,
  caseNumber,
  judge,
  documentType,
  comesNow
) => {
  const template = [
    new Paragraph({
      text: `${jurisdiction}`,
      style: "normalIndent",
    }),
    new Paragraph({ text: `${venue}`, style: "normalIndent" }),
    new Paragraph({
      text: "________________________________________________",
    }),
    new Paragraph({
      text: `${plaintiff}`,
      style: "normalIndentSpacingAfter",
    }),
    new Paragraph({
      text: `Plaintiffs,                                                            Index No.: ${caseNumber}`,
      style: "captionIndent",
    }),
    new Paragraph({
      text: `-against-                                                                                                   Judge: ${judge}`,
      style: "normalIndentMostSpacingAfter",
    }),
    new Paragraph({
      text: `${defendant}`,
      style: "normalIndentSpacingAfter",
    }),
    new Paragraph({
      text: "Defendants.",
      style: "captionIndent",
    }),
    new Paragraph({
      text: "________________________________________________",
      style: "normalIndent",
    }),
    new Paragraph({
      style: "headingIndent",
      children: [
        new TextRun({
          text: `RESPONSE TO ${documentType}`,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      style: "reset",
      children: [
        new TextRun({
          text: `COMES NOW, ${comesNow}, by and through the undersigned counsel, in accordance with NY CPLR § 3133, et. seq.,  as and for its response to the ${documentType.toLowerCase()}, served upon it, and states as follows:`,
          bold: false,
        }),
      ],
    }),
  ];

  return template;
};
