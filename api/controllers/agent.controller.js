export const getAllAgents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      verified,
      accountType,
      state,
      lga,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(verified !== undefined && { verified: verified === 'true' }),
      ...(accountType && { accountType }),
      ...(state && { state }),
      ...(lga && { lga }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [agents, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profilePhoto: true,
          companyPhoto: true,
          companyName: true,
          accountType: true,
          verified: true,
          address: true,
          state: true,
          lga: true,
          aboutCompany: true,
          services: true,
          createdAt: true,
          _count: {
            select: {
              listings: {
                where: { status: 'APPROVED' },
              },
            },
          },
        },
        orderBy: { [sortBy]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      agents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Failed to fetch agents!' });
  }
};

export const getSingleAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        profilePhoto: true,
        companyPhoto: true,
        companyName: true,
        accountType: true,
        verified: true,
        address: true,
        state: true,
        lga: true,
        aboutCompany: true,
        services: true,
        phoneNumber: true,
        whatsAppNum: true,
        email: true,
        createdAt: true,
        listings: {
          where: { status: 'APPROVED' },
          include: {
            _count: {
              select: {
                reviews: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            listings: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found!' });
    }

    res.status(200).json(agent);
  } catch (error) {
    console.error('Get single agent error:', error);
    res.status(500).json({ message: 'Failed to fetch agent!' });
  }
};
