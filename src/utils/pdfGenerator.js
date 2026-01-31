import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generatePortfolioPDF = (studentData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // --- Helper Functions ---
    const addSectionHeader = (title, y) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, y);
        doc.setLineWidth(0.5);
        doc.line(14, y + 2, pageWidth - 14, y + 2);
        return y + 10;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'MMM dd, yyyy');
    };

    // --- Title Page / Header ---
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Student E-Portfolio', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Student Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const profile = studentData.profile || {};
    const detailLeft = 14;
    const detailValueLeft = 60;

    // Name
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', detailLeft, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${profile.firstName || ''} ${profile.middleName || ''} ${profile.lastName || ''}`, detailValueLeft, yPos);
    yPos += 7;

    // Email
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', detailLeft, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(studentData.email || '-', detailValueLeft, yPos);
    yPos += 7;

    // Course/Institution
    doc.setFont('helvetica', 'bold');
    doc.text('Institution:', detailLeft, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.institution || '-', detailValueLeft, yPos);
    yPos += 7;

    // Field of Study
    doc.setFont('helvetica', 'bold');
    doc.text('Field of Study:', detailLeft, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${profile.fieldOfStudy || '-'} (${profile.yearOfStudy || '-'})`, detailValueLeft, yPos);
    yPos += 15;

    // About
    if (profile.about) {
        doc.setFont('helvetica', 'bold');
        doc.text('About:', detailLeft, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitAbout = doc.splitTextToSize(profile.about, pageWidth - 28);
        doc.text(splitAbout, detailLeft, yPos);
        yPos += splitAbout.length * 5 + 10;
    }

    // Vision
    if (profile.vision) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Vision & Goals:', detailLeft, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const splitVision = doc.splitTextToSize(profile.vision, pageWidth - 28);
        doc.text(splitVision, detailLeft, yPos);
        yPos += splitVision.length * 5 + 10;
    }

    // --- Sections ---

    // Generator for generic tables
    const generateTable = (title, head, body) => {
        if (!body || body.length === 0) return;

        // Check if we need a new page
        if (yPos > doc.internal.pageSize.height - 40) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, yPos);
        yPos += 5;

        autoTable(doc, {
            startY: yPos,
            head: [head],
            body: body,
            theme: 'plain', // Formal style
            styles: { fontSize: 10, cellPadding: 3, lineColor: [200, 200, 200], lineWidth: 0.1 },
            headStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
            margin: { top: 20 },
            didDrawPage: (data) => {
                yPos = data.cursor.y + 15;
            }
        });

        // Update yPos after table
        yPos = doc.lastAutoTable.finalY + 15;
    };

    // 1. Academic Achievements
    const academicBody = (studentData.academicAchievements || []).map(item => [
        item.courseName,
        item.offeredBy,
        item.modeOfStudy,
        item.duration,
        item.currentStatus
    ]);
    generateTable('Academic Achievements', ['Course Name', 'Offered By', 'Mode', 'Duration', 'Status'], academicBody);

    // 2. Course Reflections
    const reflectionsBody = (studentData.courseReflections || []).map(item => [
        formatDate(item.date),
        item.topicOfSession,
        `${item.rating}/5`,
        item.whatDidILearn
    ]);
    generateTable('Course Reflections', ['Date', 'Topic', 'Rating', 'Key Learning'], reflectionsBody);

    // 3. Be The Change
    const btcBody = (studentData.beTheChange || []).map(item => [
        item.year,
        item.reflectOnImpact
    ]);
    generateTable('Be The Change', ['Year', 'Reflection on Impact'], btcBody);

    // 4. Research & Publications
    const researchBody = (studentData.researchPublications || []).map(item => [
        item.projectTitle,
        item.journal,
        item.typeOfArticle,
        item.authors
    ]);
    generateTable('Research & Publications', ['Title', 'Journal', 'Type', 'Authors'], researchBody);

    // 5. Interdisciplinary Collaboration
    const collabBody = (studentData.interdisciplinaryCollaboration || []).map(item => [
        item.projectTitle,
        item.disciplinesInvolved,
        item.significance
    ]);
    generateTable('Interdisciplinary Collaboration', ['Project', 'Disciplines', 'Significance'], collabBody);

    // 6. Conference Participation
    const confBody = (studentData.conferenceParticipation || []).map(item => [
        item.conferenceName,
        formatDate(item.dateOfConference),
        item.venue,
        item.attendeePresenter
    ]);
    generateTable('Conference Participation', ['Conference', 'Date', 'Venue', 'Role'], confBody);

    // 7. Competitions & Awards
    const compBody = (studentData.competitionsAwards || []).map(item => [
        item.competition,
        formatDate(item.date),
        item.awardsReceived,
        item.venue
    ]);
    generateTable('Competitions & Awards', ['Competition', 'Date', 'Award', 'Venue'], compBody);

    // 8. Workshops & Training
    const workshopBody = (studentData.workshopsTraining || []).map(item => [
        item.nameOfWorkshop,
        item.conductedBy,
        item.skillsAcquired
    ]);
    generateTable('Workshops & Training', ['Workshop', 'Conducted By', 'Skills Acquired'], workshopBody);

    // 9. Clinical Experiences
    const clinicalBody = (studentData.clinicalExperiences || []).map(item => [
        item.ethicalDilemma,
        item.bioethicsPrinciple,
        item.whatWasDone
    ]);
    generateTable('Clinical Experiences', ['Ethical Dilemma', 'Principle', 'Action Taken'], clinicalBody);

    // 10. Voluntary Participation
    const volBody = (studentData.voluntaryParticipation || []).map(item => [
        item.nameOfOrganisation,
        item.yourRole,
        item.whatDidYouLearn
    ]);
    generateTable('Voluntary Participation', ['Organization', 'Role', 'Learning'], volBody);

    // 11. Ethics Through Art
    const ethicsBody = (studentData.ethicsThroughArt || []).map(item => [
        item.workAbout,
        item.whyThisTopic,
        item.howExpressed
    ]);
    generateTable('Ethics Through Art', ['Work About', 'Concept', 'Expression'], ethicsBody);

    // 12. Thoughts To Actions
    const thoughtsBody = (studentData.thoughtsToActions || []).map(item => [
        item.futurePlan,
        formatDate(item.targetDate),
        item.status
    ]);
    generateTable('Thoughts To Actions', ['Future Plan', 'Target Date', 'Status'], thoughtsBody);

    // Footer with Page Numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    // Save
    doc.save(`Portfolio_${profile.firstName || 'Student'}_${profile.lastName || ''}.pdf`);
};
