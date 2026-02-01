import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import logo from '../assets/images/logo.png';
import { API_URL } from '../config/constants';

export const generatePortfolioPDF = async (studentData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const themeColor = [139, 92, 246]; // Brand Purple (rgb)

    // --- Helper Functions ---
    const addWatermark = (pdfDoc) => {
        const totalPages = pdfDoc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdfDoc.setPage(i);
            pdfDoc.saveGraphicsState();
            pdfDoc.setGState(new pdfDoc.GState({ opacity: 0.05 }));

            // Centered Logo Watermark - Bigger
            const imgWidth = 140;
            const imgHeight = 70;
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            try {
                pdfDoc.addImage(logo, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
            } catch (e) {
                console.error("Watermark logo error:", e);
            }

            pdfDoc.restoreGraphicsState();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (e) {
            return dateString;
        }
    };

    // --- Title Page ---
    let yPos = 15;

    // Header Logo (Centered)
    try {
        doc.addImage(logo, 'PNG', (pageWidth / 2) - 30, yPos, 60, 30);
        yPos += 35;
    } catch (e) {
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Student E-Portfolio', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;
    }

    // Horizontal Line
    doc.setDrawColor(themeColor[0], themeColor[1], themeColor[2]);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 10;

    const profile = studentData.profile || {};

    // Layout: Left (Info), Right (Photo)
    const detailLeft = 14;
    const detailValueLeft = 60;
    const startY = yPos;

    // Profile Picture (Moved to Top Right of content)
    if (profile.profilePicture) {
        try {
            const photoUrl = `${API_URL}${profile.profilePicture}`;
            // For simple implementation without async image loading complex logic,
            // we assume it's reachable. In a real app we might need to convert it to base64 first.
            doc.addImage(photoUrl, 'JPEG', pageWidth - 54, startY, 40, 40);
        } catch (e) {
            console.error("Profile picture failed:", e);
        }
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const addDetail = (label, value) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, detailLeft, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value || '-'), detailValueLeft, yPos);
        yPos += 6;
    };

    addDetail('Name', `${profile.firstName || ''} ${profile.middleName || ''} ${profile.lastName || ''}`);
    addDetail('Email', studentData.email);
    addDetail('Date of Birth', formatDate(profile.dateOfBirth));
    addDetail('Sex', profile.sex);
    addDetail('Phone Number', profile.phoneNumber);
    addDetail('Institution', profile.institution);
    addDetail('Education Level', profile.levelOfEducation);
    addDetail('Field of Study', profile.fieldOfStudy);
    addDetail('Year of Study', profile.yearOfStudy);
    addDetail('Country', profile.country);

    yPos = Math.max(yPos, startY + 45) + 5;

    // About
    if (profile.about) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
        doc.text('About:', detailLeft, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const splitAbout = doc.splitTextToSize(profile.about, pageWidth - 28);
        doc.text(splitAbout, detailLeft, yPos);
        yPos += splitAbout.length * 5 + 8;
    }

    // Vision
    if (profile.vision) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
        doc.text('Vision & Goals:', detailLeft, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const splitVision = doc.splitTextToSize(profile.vision, pageWidth - 28);
        doc.text(splitVision, detailLeft, yPos);
        yPos += splitVision.length * 5 + 10;
    }

    // --- Sections (Approved Data Only) ---

    // Generator for generic tables
    const generateTable = (title, head, body) => {
        if (!body || body.length === 0) return;

        // Check if we need a new page
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
        doc.text(title, 14, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 4;

        autoTable(doc, {
            startY: yPos,
            head: [head],
            body: body,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: themeColor, textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { top: 20 },
            didDrawPage: (data) => {
                yPos = data.cursor.y + 10;
            }
        });

        yPos = doc.lastAutoTable.finalY + 12;
    };

    // Filter Helper
    const filterApproved = (arr) => (arr || []).filter(item => item.status === 'Approved');

    // 1. Academic Achievements
    const academicBody = filterApproved(studentData.academicAchievements).map(item => [
        item.courseName,
        item.offeredBy,
        item.modeOfStudy,
        item.duration,
        item.currentStatus
    ]);
    generateTable('Academic Achievements', ['Course Name', 'Offered By', 'Mode', 'Duration', 'Status'], academicBody);

    // 2. Course Reflections
    const reflectionsBody = filterApproved(studentData.courseReflections).map(item => [
        formatDate(item.date),
        item.topicOfSession,
        `${item.rating}/5`,
        item.whatDidILearn
    ]);
    generateTable('Course Reflections', ['Date', 'Topic', 'Rating', 'Key Learning'], reflectionsBody);

    // 3. Be The Change
    const btcBody = filterApproved(studentData.beTheChange).map(item => [
        item.year,
        item.reflectOnImpact
    ]);
    generateTable('Be The Change', ['Year', 'Reflection on Impact'], btcBody);

    // 4. Research & Publications
    const researchBody = filterApproved(studentData.researchPublications).map(item => [
        item.projectTitle,
        item.journal,
        item.typeOfArticle,
        item.authors
    ]);
    generateTable('Research & Publications', ['Title', 'Journal', 'Type', 'Authors'], researchBody);

    // 5. Interdisciplinary Collaboration
    const collabBody = filterApproved(studentData.interdisciplinaryCollaboration).map(item => [
        item.projectTitle,
        item.disciplinesInvolved,
        item.significance
    ]);
    generateTable('Interdisciplinary Collaboration', ['Project', 'Disciplines', 'Significance'], collabBody);

    // 6. Conference Participation
    const confBody = filterApproved(studentData.conferenceParticipation).map(item => [
        item.conferenceName,
        formatDate(item.dateOfConference),
        item.venue,
        item.attendeePresenter
    ]);
    generateTable('Conference Participation', ['Conference', 'Date', 'Venue', 'Role'], confBody);

    // 7. Competitions & Awards
    const compBody = filterApproved(studentData.competitionsAwards).map(item => [
        item.competition,
        formatDate(item.date),
        item.awardsReceived,
        item.venue
    ]);
    generateTable('Competitions & Awards', ['Competition', 'Date', 'Award', 'Venue'], compBody);

    // 8. Workshops & Training
    const workshopBody = filterApproved(studentData.workshopsTraining).map(item => [
        item.nameOfWorkshop,
        item.conductedBy,
        item.skillsAcquired
    ]);
    generateTable('Workshops & Training', ['Workshop', 'Conducted By', 'Skills Acquired'], workshopBody);

    // 9. Clinical Experiences
    const clinicalBody = filterApproved(studentData.clinicalExperiences).map(item => [
        item.ethicalDilemma,
        item.bioethicsPrinciple,
        item.whatWasDone
    ]);
    generateTable('Clinical Experiences', ['Ethical Dilemma', 'Principle', 'Action Taken'], clinicalBody);

    // 10. Voluntary Participation
    const volBody = filterApproved(studentData.voluntaryParticipation).map(item => [
        item.nameOfOrganisation,
        item.yourRole,
        item.whatDidYouLearn
    ]);
    generateTable('Voluntary Participation', ['Organization', 'Role', 'Learning'], volBody);

    // 11. Ethics Through Art
    const ethicsBody = filterApproved(studentData.ethicsThroughArt).map(item => [
        item.workAbout,
        item.whyThisTopic,
        item.howExpressed
    ]);
    generateTable('Ethics Through Art', ['Work About', 'Concept', 'Expression'], ethicsBody);

    // 12. Thoughts To Actions
    const thoughtsBody = filterApproved(studentData.thoughtsToActions).map(item => [
        item.futurePlan,
        item.status
    ]);
    generateTable('Thoughts To Actions', ['Future Plan', 'Status'], thoughtsBody);

    // --- Last Page: Signature Section ---
    if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
    } else {
        yPos += 20;
    }

    const facultyName = studentData.faculty?.name || '________________';
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Verified By:', pageWidth - 80, yPos);
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.text(facultyName, pageWidth - 80, yPos);
    doc.line(pageWidth - 80, yPos + 2, pageWidth - 14, yPos + 2);
    yPos += 5;
    doc.setFontSize(8);
    doc.text('(Faculty Signature)', pageWidth - 80, yPos);

    // Add watermark and page numbers
    const pageCount = doc.internal.getNumberOfPages();
    addWatermark(doc);

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    // Save
    doc.save(`Portfolio_${profile.firstName || 'Student'}_${profile.lastName || ''}.pdf`);
};
