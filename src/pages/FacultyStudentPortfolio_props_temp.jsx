
const updatePendingCount = (sectionId) => {
    setPendingCounts(prev => ({
        ...prev,
        [sectionId]: Math.max(0, (prev[sectionId] || 0) - 1)
    }));
};

const props = {
    isFaculty: true,
    studentId: studentId,
    studentData: student,
    updatePendingCount: updatePendingCount
};
