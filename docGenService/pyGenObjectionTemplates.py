import json
from docx import Document
from docx.shared import Inches
from docx.shared import Pt
from docx.shared import Length
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT


# New Jersey *******************************************************************/
def make_nj_gen_obj(
    document,
    jurisdiction,
    venue,
    caption1,
    caption2,
    mainHeader,
    caseNumber,
    judge,
    clientPosition,
):
    objectionsArray = [
        f"All of {clientPosition}’s responses to the discovery requests being answered are subject to the following objections, in addition to any and all objections stated in the answers to each individual request.",
        "[Party] objects to the definitions and instructions included in [propounding party’s] discovery requests, to the extent that:",
        "(1)  the definitions or instructions are inconsistent with any applicable statutes, regulations, laws, legal precedents, or the terms of any applicable agreements or other legal documents;",
        "(2)  the definitions or instructions seek to impose on [party] obligations that exceed the requirements of the New Jersey Rules of Court; and/or",
        "(3)  the definitions are overly broad or inclusive, and presume or assume unproven assertions of fact or law.",
        "4 In responding to these requests, [party] does not admit or concede any presumptions or assumptions embedded in the propounding parties' definitions",
        "[Party] objects to any and all requests to the extent they seek or may be interpreted to seek disclosure of information not within the scope of R. 4:10-2(a) or not within the scope of what is permitted under any applicable Case Management Order entered in this case, and [party] reserves all rights to contest any such matters in any other context or proceeding where they may be relevant.",
        "[party] objects to any and all requests to the extent they seek or may be interpreted to seek disclosure of any information which (1) is subject to the attorney-client privilege; (2) is covered by the 'work product' doctrine; (3) is subject to the self-critical analysis privilege; (4) is subject to the required reports privilege; (5) is subject to a joint defense or common interest privilege; (6) was generated in anticipation of litigation or for trial by or for [party] or any representatives of [party] including attorneys, consultants or agents; (7) relates to the identity or opinions of consultants or experts who have been retained or specially employed in anticipation of litigation and who are not expected to be called as witnesses at trial; (8) is protected as a trade secret; (9) is subject to a protective order or confidentiality order or agreement which was entered or made in another matter, to the extent the same prevents disclosure in this matter; and/or (10) is otherwise privileged, protected from disclosure, or beyond the scope of discovery under applicable rules and laws. [party] does not intend to disclose or produce any such information in response to the request being answered, and the following responses should be read accordingly. Any disclosure of information which is privileged or otherwise protected from disclosure is inadvertent, and all rights to demand return and/or destruction of any such information are reserved.",
        "[party] objects to the propounding parties' requests insofar as they seek a proposition of law and/or the formulation of a legal theory, or seek contentions regarding factual matters as to which essential discovery is incomplete. [party]'s current responses to such requests necessarily cannot present all information [party] may ultimately discover and utilize or rely upon in this matter. [party] thus reserves all rights to supplement or amend its responses in accordance with applicable rules, laws, orders or agreements of the parties, if, as and when circumstances may warrant.",
    ]
    print(
        "______________________________________________________________NEW JERSEY MAKE OBJECTION FIRED"
    )
    p = document.add_paragraph()
    p.add_run("GENERAL OBJECTIONS").underline = True
    p.paragraph_format.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
    arrLen = len(respArray)

    for obj in objectionsArray:
        if count == arrLen:
            break
        paragraph = document.add_paragraph(f"{count}.")
        paragraph = document.add_paragraph(obj)
        paragraph.paragraph_format.line_spacing = Pt(20)
        paragraph.paragraph_format.space_after = Pt(12)

        count = count + 1

    return document
