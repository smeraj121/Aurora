const db = require("../config/db");

exports.getCustomers = async (search) => {
    let query = `
        SELECT
            id,
            full_name AS "fullName",
            phone,
            email,
            total_visits AS "totalVisits",
            total_spent AS "totalSpent",
            last_visit_date AS "lastVisitDate"
        FROM customers
    `;

    const params = [];

    if (search) {
        query += `
            WHERE
                LOWER(full_name) LIKE LOWER($1)
                OR phone LIKE $1
        `;

        params.push(`%${search}%`);
    }

    query += `
        ORDER BY full_name
        LIMIT 20
    `;

    const { rows } = await db.query(query, params);

    return rows;
};

exports.getCustomerDetails = async (id) => {
    const { rows } = await db.query(
        `
        SELECT
            id,
            full_name AS "fullName",
            phone,
            email,
            notes,
            total_visits AS "totalVisits",
            total_spent AS "totalSpent",
            last_visit_date AS "lastVisitDate"
        FROM customers
        WHERE id = $1
        `,
        [id]
    );

    return rows[0];
};

exports.getCustomerHistory = async (id) => {
    const { rows } = await db.query(
        `
        SELECT
            a.id,
            a.appointment_date AS "appointmentDate",

            TO_CHAR(
                a.time_slot,
                'HH12:MI AM'
            ) AS "startTime",

            STRING_AGG(
                s.name,
                ', '
            ) AS "serviceName",

            st.name AS "staffName",

            a.total_price AS amount,

            a.status

        FROM appointments a

        JOIN appointment_services aps
            ON aps.appointment_id = a.id

        JOIN services s
            ON s.id = aps.service_id

        LEFT JOIN staff st
            ON st.id = a.staff_id

        WHERE a.customer_id = $1

        GROUP BY
            a.id,
            a.appointment_date,
            a.time_slot,
            a.total_price,
            a.status,
            st.name

        ORDER BY
            a.appointment_date DESC,
            a.time_slot DESC
        `,
        [id]
    );

    return rows;
};

exports.createCustomer = async (customer) => {
    const { rows } = await db.query(
        `
        INSERT INTO customers
        (
            full_name,
            phone,
            email,
            notes
        )
        VALUES
        (
            $1,
            $2,
            $3,
            $4
        )
        RETURNING *
        `,
        [
            customer.fullName,
            customer.phone,
            customer.email,
            customer.notes,
        ]
    );

    return rows[0];
};

exports.updateCustomer = async (id, customer) => {
    const { rows } = await db.query(
        `
        UPDATE customers
        SET
            full_name = $1,
            phone = $2,
            email = $3,
            notes = $4,
            updated_at = NOW()
        WHERE id = $5
        RETURNING *
        `,
        [
            customer.fullName,
            customer.phone,
            customer.email,
            customer.notes,
            id,
        ]
    );

    return rows[0];
};