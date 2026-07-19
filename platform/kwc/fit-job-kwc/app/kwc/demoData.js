export const demoRoutes = [
    {
        key: 'home',
        path: '/',
        label: '首页',
        description: '第一阶段演示故事线总览',
        formId: 'fitJobDemoHomePage',
        audience: '全角色'
    },
    {
        key: 'student',
        path: '/student',
        label: '学生工作台',
        description: '学生画像、任务与成长档案',
        formId: 'studentWorkbenchPage',
        audience: '学生 / 就业导师'
    },
    {
        key: 'resume',
        path: '/resume',
        label: '简历诊断',
        description: '关键词、结构与改写建议',
        formId: 'resumeDiagnosisPage',
        audience: '学生 / 就业导师'
    },
    {
        key: 'jobs',
        path: '/jobs',
        label: '岗位推荐',
        description: '六维匹配、风险与申请动作',
        formId: 'jobRecommendationPage',
        audience: '学生 / 企业 HR'
    },
    {
        key: 'interview',
        path: '/interview',
        label: 'AI 面试',
        description: '多轮问答、评分与训练报告',
        formId: 'interviewTrainingPage',
        audience: '学生 / 就业导师'
    },
    {
        key: 'policy',
        path: '/policy',
        label: '政策问答',
        description: 'RAG 问答与来源引用',
        formId: 'policyQaPage',
        audience: '学生 / 辅导员'
    },
    {
        key: 'dashboard',
        path: '/dashboard',
        label: '就业驾驶舱',
        description: '趋势、风险与质量报告',
        formId: 'employmentDashboardPage',
        audience: '院系管理员'
    }
];

export const studentProfile = {
    studentId: 'STU-DEMO-001',
    displayName: '学生 A',
    avatarText: 'A',
    collegeName: '软件工程学院',
    majorName: '软件工程',
    graduationYear: 2027,
    targetRoles: ['前端开发实习生', 'AI 产品实习生'],
    preferredCities: ['杭州', '上海'],
    profileCompletion: 82,
    readinessScore: 84,
    employmentStatus: 'ACTIVE_SEARCH',
    skillTags: ['React', 'TypeScript', '数据可视化', '产品原型'],
    tasks: [
        {
            taskId: 'TASK-DEMO-001',
            title: '补充项目量化指标',
            ownerRole: 'STUDENT',
            dueLabel: '今天 18:00',
            priority: 'HIGH',
            status: 'TODO'
        },
        {
            taskId: 'TASK-DEMO-002',
            title: '确认 5 个高匹配岗位',
            ownerRole: 'EMPLOYMENT_TUTOR',
            dueLabel: '明天 12:00',
            priority: 'MEDIUM',
            status: 'TODO'
        },
        {
            taskId: 'TASK-DEMO-003',
            title: '完成技术面模拟训练',
            ownerRole: 'INTERVIEW_AGENT',
            dueLabel: '本周五',
            priority: 'MEDIUM',
            status: 'TODO'
        }
    ],
    milestones: [
        { stage: 'PROFILE_READY', label: '完成学生画像', status: 'DONE' },
        { stage: 'RESUME_READY', label: '简历诊断与改写', status: 'IN_PROGRESS' },
        { stage: 'JOB_MATCHED', label: '岗位匹配与投递', status: 'TODO' },
        { stage: 'INTERVIEW_READY', label: 'AI 面试训练', status: 'TODO' }
    ]
};

export const jobPostings = [
    {
        key: 'one',
        jobId: 'JOB-DEMO-FE-001',
        title: '前端开发实习生',
        companyName: '示例科技 A',
        city: '杭州',
        compensation: '180-220 元/天',
        attendance: '每周 3 天',
        matchScore: 91,
        dimensions: [94, 88, 92, 90, 86, 84],
        reason: 'React、TypeScript 与数据可视化经历命中 JD 核心技能，项目交付证据与岗位成长路径匹配。',
        gap: '单元测试、性能监控和 CI/CD 尚缺少可验证证据，不能为了匹配 JD 直接堆叠关键词。',
        advice: '准备两个量化 STAR 案例：首屏性能优化和复杂图表交互，并补齐工程质量追问。',
        hardConditionStatus: 'PASS'
    },
    {
        key: 'two',
        jobId: 'JOB-DEMO-PM-002',
        title: 'AI 产品实习生',
        companyName: '示例智能 B',
        city: '上海',
        compensation: '200-250 元/天',
        attendance: '可转正',
        matchScore: 87,
        dimensions: [82, 86, 92, 88, 94, 78],
        reason: 'AI 产品原型、需求分析和技术背景形成互补，探索型项目经历与岗位动机匹配。',
        gap: '商业化指标和产品数据分析证据偏少，用户研究样本量尚不足。',
        advice: '准备从用户反馈到原型迭代的案例，说明如何衡量准确率、采纳率与留存。',
        hardConditionStatus: 'PASS'
    },
    {
        key: 'three',
        jobId: 'JOB-DEMO-DV-003',
        title: '数据可视化实习生',
        companyName: '示例数据 C',
        city: '杭州',
        compensation: '160-210 元/天',
        attendance: '远程友好',
        matchScore: 84,
        dimensions: [86, 84, 88, 82, 80, 84],
        reason: '图表开发、就业驾驶舱和前端交互经历与岗位任务贴合。',
        gap: '数据建模、指标口径和大屏性能优化经历不够突出。',
        advice: '准备行业分布、薪资区间和就业率趋势三类图表的指标口径说明。',
        hardConditionStatus: 'PASS'
    },
    {
        key: 'four',
        jobId: 'JOB-DEMO-LC-004',
        title: '低代码实施顾问实习生',
        companyName: '示例云服 D',
        city: '南京',
        compensation: '150-180 元/天',
        attendance: '项目制',
        matchScore: 82,
        dimensions: [78, 80, 86, 88, 84, 76],
        reason: '苍穹低代码项目经历与平台配置意识加分，适合参与表单、流程和权限模型落地。',
        gap: '企业实施、客户沟通和业务蓝图文档经验较少。',
        advice: '准备岗位申请表单与四角色权限矩阵的设计说明。',
        hardConditionStatus: 'PASS'
    },
    {
        key: 'five',
        jobId: 'JOB-DEMO-JAVA-005',
        title: 'Java 后端开发实习生',
        companyName: '示例软件 E',
        city: '苏州',
        compensation: '170-220 元/天',
        attendance: 'Java 17',
        matchScore: 76,
        dimensions: [70, 74, 72, 82, 78, 62],
        reason: '具备 TypeScript 与部分 Java 基础，在 AI 网关或匹配服务方向仍有成长空间。',
        gap: 'Spring Boot、JUnit、事务和接口设计证据不足。',
        advice: '补充一个 Java 服务小项目，覆盖 DTO、校验、测试和异常处理。',
        hardConditionStatus: 'REVIEW'
    }
];

export const resumeDiagnosis = {
    reportId: 'RESUME-REPORT-DEMO-001',
    studentId: studentProfile.studentId,
    targetJobId: jobPostings[0].jobId,
    resumeVersion: '前端开发简历 V3',
    score: 86,
    keywordCoverage: [
        { keyword: 'React', status: 'HIT' },
        { keyword: 'TypeScript', status: 'HIT' },
        { keyword: '性能优化', status: 'MISSING' },
        { keyword: '单元测试', status: 'MISSING' },
        { keyword: '数据可视化', status: 'WEAK' }
    ],
    sections: [
        { section: 'PROJECT_EXPERIENCE', score: 82, status: 'NEEDS_EVIDENCE' },
        { section: 'SKILLS', score: 88, status: 'READY' },
        { section: 'ROLE_MATCH', score: 86, status: 'READY' }
    ],
    rewriteSuggestions: [
        { suggestionId: 'SUG-DEMO-001', field: 'projectExperience', action: 'ADD_METRIC', status: 'PENDING' },
        { suggestionId: 'SUG-DEMO-002', field: 'projectExperience', action: 'ADD_BUSINESS_VALUE', status: 'PENDING' },
        { suggestionId: 'SUG-DEMO-003', field: 'skills', action: 'ALIGN_JD_KEYWORDS', status: 'PENDING' }
    ]
};

export const interviewSession = {
    sessionId: 'INTERVIEW-DEMO-001',
    studentId: studentProfile.studentId,
    targetJobId: jobPostings[0].jobId,
    defaultType: 'TECHNICAL',
    types: [
        { key: 'HR', label: 'HR 面', description: '求职动机、协作与稳定性' },
        { key: 'TECHNICAL', label: '技术/业务面', description: '项目真实性、工程能力与业务理解' },
        { key: 'COMPREHENSIVE', label: '综合素质面', description: '学习敏捷度、价值观与跨团队推进' }
    ],
    questions: {
        HR: [
            {
                questionId: 'INT-HR-001',
                dimension: 'MOTIVATION',
                question: '请用 2 分钟介绍你自己，并说明为什么投递前端开发实习岗位。',
                focus: '表达结构、岗位理解、经历连接',
                sampleAnswer: '我的求职方向是前端开发。我在课程项目里负责就业推荐页面，用 KWC 完成岗位列表、匹配解释和图表展示。'
            },
            {
                questionId: 'INT-HR-002',
                dimension: 'COLLABORATION',
                question: '讲一个你与同学在项目目标上出现分歧的经历，你如何推动达成一致？',
                focus: 'STAR 结构、冲突处理、复盘意识',
                sampleAnswer: '我先整理用户路径与优先级，再用低保真原型说明取舍，最终团队提前两天完成可演示版本。'
            },
            {
                questionId: 'INT-HR-003',
                dimension: 'STABILITY',
                question: '如果实习前两周主要修复小问题和补文档，你会如何安排？',
                focus: '预期管理、主动性、学习计划',
                sampleAnswer: '我会建立问题清单和代码地图，用小任务熟悉规范，再主动申请负责一个完整的小模块。'
            }
        ],
        TECHNICAL: [
            {
                questionId: 'INT-TECH-001',
                dimension: 'ENGINEERING',
                question: '请介绍就业推荐项目中你负责的模块、技术选型和最难的问题。',
                focus: '项目真实性、技术选型、量化结果',
                sampleAnswer: '我负责岗位列表、六维匹配解释和趋势图表，使用 KWC、JavaScript 与 CSS。最难的是把推荐分数、证据和行动建议放进同一条可解释链路。'
            },
            {
                questionId: 'INT-TECH-002',
                dimension: 'PROBLEM_SOLVING',
                question: '一个页面首次加载很慢，你会从哪些层面排查并优化？',
                focus: '排查路径、性能指标、验证方式',
                sampleAnswer: '我会先看网络瀑布、资源体积、长任务与渲染次数，再分别处理接口、缓存、分包和重复渲染，并对比优化前后的指标。'
            },
            {
                questionId: 'INT-TECH-003',
                dimension: 'BUSINESS',
                question: '如何设计就业率趋势图，避免管理员只看到数字却看不到风险？',
                focus: '用户视角、指标解释、行动建议',
                sampleAnswer: '就业率需要与未就业人数、风险学生、行业去向一起看，并在趋势图旁给出可跟进名单和负责人。'
            }
        ],
        COMPREHENSIVE: [
            {
                questionId: 'INT-COMP-001',
                dimension: 'JUDGEMENT',
                question: '讲一个你从 0 到 1 推动想法落地的经历，重点说明为什么值得做。',
                focus: '目标判断、证据质量、表达聚焦',
                sampleAnswer: '我从同学反馈中识别出简历与 JD 不匹配的问题，访谈 8 位同学后先验证关键词缺失和成果无数据两个高频痛点。'
            },
            {
                questionId: 'INT-COMP-002',
                dimension: 'LEARNING',
                question: '不熟悉业务领域，但必须一周内交付原型，你会怎么推进？',
                focus: '学习路径、信息筛选、阶段交付',
                sampleAnswer: '我会先访谈关键角色，确认主流程、核心指标和禁区，前三天交付低保真，第五天验证，第七天补齐交互。'
            },
            {
                questionId: 'INT-COMP-003',
                dimension: 'RESPONSIBILITY',
                question: '你如何理解 AI 在就业服务中的边界？',
                focus: '责任意识、业务伦理、可解释性',
                sampleAnswer: 'AI 可以诊断、推荐和训练，但不能替学生做关键决定；系统必须展示证据、风险和人工确认入口。'
            }
        ]
    },
    report: {
        reportId: 'INTERVIEW-REPORT-DEMO-001',
        overallScore: 84,
        level: '基本达标',
        dimensions: [
            { key: 'LOGIC', label: '逻辑性', score: 87 },
            { key: 'COMPLETENESS', label: '完整性', score: 81 },
            { key: 'EXPRESSION', label: '表达力', score: 85 },
            { key: 'ROLE_FIT', label: '岗位相关性', score: 84 }
        ],
        suggestions: ['补充项目规模与性能数字', '每题结尾回扣 JD 关键词', '准备一个失败复盘案例']
    }
};

export const dashboardSnapshot = {
    snapshotId: 'DASHBOARD-DEMO-2026-07',
    collegeCode: 'COLLEGE-DEMO-SE',
    collegeName: '软件工程学院',
    graduationYear: 2026,
    generatedAt: '2026-07-19 10:00',
    metrics: [
        { key: 'EMPLOYMENT_RATE', label: '就业率', value: 86.4, unit: '%', delta: 4.8 },
        { key: 'INTERNSHIP_COUNT', label: '实习中人数', value: 328, unit: '人', delta: 36 },
        { key: 'UNEMPLOYED_COUNT', label: '未就业人数', value: 52, unit: '人', delta: -18 },
        { key: 'RISK_STUDENT_COUNT', label: '风险学生数', value: 19, unit: '人', delta: -7 }
    ],
    employmentTrend: [58, 64, 71, 78, 83, 86.4],
    industryDistribution: [
        { industry: '互联网/软件', percentage: 38 },
        { industry: '智能制造', percentage: 21 },
        { industry: '数字政务', percentage: 15 },
        { industry: '金融科技', percentage: 12 },
        { industry: '其他', percentage: 14 }
    ],
    salaryRanges: [
        { range: '3k 以下', count: 18 },
        { range: '3-5k', count: 72 },
        { range: '5-8k', count: 146 },
        { range: '8-12k', count: 96 },
        { range: '12k 以上', count: 34 }
    ],
    riskStudents: [
        { studentId: 'STU-DEMO-RISK-A', displayName: '学生 A', riskCode: 'LOW_ACTIVITY', ownerRole: 'COUNSELOR', level: 'HIGH' },
        { studentId: 'STU-DEMO-RISK-B', displayName: '学生 B', riskCode: 'LOW_INTERVIEW_CONVERSION', ownerRole: 'EMPLOYMENT_TUTOR', level: 'MEDIUM' },
        { studentId: 'STU-DEMO-RISK-C', displayName: '学生 C', riskCode: 'UNCLEAR_DIRECTION', ownerRole: 'COUNSELOR', level: 'MEDIUM' }
    ],
    aiHighlights: [
        '未就业学生主要集中在简历完成度低于 70% 的群体。',
        '智能制造岗位增长最快，建议增加工业软件岗位池。',
        '高薪学生普遍具备竞赛或真实项目的量化证据。'
    ]
};

export const policyQaCases = [
    {
        caseId: 'POLICY-DEMO-001',
        question: '毕业生基层就业补贴如何申请？',
        answer: '演示系统会先判断毕业年度、单位类型、社保记录和申请地区，再给出材料清单与办理窗口。',
        referenceInfos: [
            { sourceId: 'MOCK-POLICY-012', title: '模拟政策：高校毕业生就业服务条目 12', region: '示例地区', url: 'https://example.com/mock-policy/012' },
            { sourceId: 'MOCK-POLICY-004', title: '模拟政策：基层就业补贴条目 04', region: '示例地区', url: 'https://example.com/mock-policy/004' }
        ]
    },
    {
        caseId: 'POLICY-DEMO-002',
        question: '实习协议和三方协议有什么区别？',
        answer: '实习协议约定实习期间的岗位、时间、指导和安全责任；三方协议用于毕业生就业去向确认。',
        referenceInfos: [
            { sourceId: 'MOCK-POLICY-007', title: '模拟政策：就业协议说明 07', region: '示例地区', url: 'https://example.com/mock-policy/007' }
        ]
    },
    {
        caseId: 'POLICY-DEMO-003',
        question: '灵活就业需要提交哪些证明？',
        answer: '演示系统会提示准备灵活就业登记表、服务合同或平台收入证明，并标记需要辅导员复核的字段。',
        referenceInfos: [
            { sourceId: 'MOCK-POLICY-018', title: '模拟政策：灵活就业登记 18', region: '示例地区', url: 'https://example.com/mock-policy/018' }
        ]
    }
];

export const demoStory = [
    { order: 1, routeKey: 'student', summary: '确认匿名学生画像、风险信号和待办任务。' },
    { order: 2, routeKey: 'resume', summary: '查看关键词缺口、结构问题和 AI 改写建议。' },
    { order: 3, routeKey: 'jobs', summary: '解释岗位为什么匹配，并触发投递准备动作。' },
    { order: 4, routeKey: 'interview', summary: '完成一轮结构化训练并生成面试报告。' },
    { order: 5, routeKey: 'policy', summary: '展示带来源引用的就业政策答复。' },
    { order: 6, routeKey: 'dashboard', summary: '从院系视角查看趋势、风险和质量报告。' }
];

export const mockDataContract = {
    contractVersion: 'm1.0',
    privacyLevel: 'ANONYMOUS_DEMO_ONLY',
    generatedAt: '2026-07-19T10:00:00+08:00',
    dtoReferences: {
        studentProfile: 'StudentProfileDTO',
        jobPosting: 'JobPostingDTO',
        resumeDiagnosis: 'ResumeDiagnosisReportDTO',
        interviewSession: 'InterviewSessionDTO',
        interviewReport: 'InterviewReportDTO',
        dashboardSnapshot: 'EmploymentDashboardDTO',
        policyAnswer: 'PolicyAnswerDTO'
    },
    formReferences: {
        student: '学生档案 / 成长任务表单',
        resume: '简历版本 / 诊断报告表单',
        jobs: '岗位库 / 岗位申请表单',
        interview: '面试场次 / 面试报告表单',
        dashboard: '就业指标快照 / 风险跟进表单',
        policy: '政策知识条目 / 问答记录表单'
    }
};

export function getDemoRoute(routeKey) {
    return demoRoutes.find((route) => route.key === routeKey) || demoRoutes[0];
}
