--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2026-07-30 17:45:37

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5277 (class 1262 OID 35367)
-- Name: auroradb4; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE auroradb4 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_India.1252';


ALTER DATABASE auroradb4 OWNER TO postgres;

\connect auroradb4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 251 (class 1255 OID 36027)
-- Name: update_customer_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_customer_stats() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Recalculate for the affected customer
    WITH stats AS (
        SELECT 
            COUNT(*) AS total_visits,
            COALESCE(SUM(total_price), 0) AS total_spent,
            COALESCE(SUM(paid_amount), 0) AS total_paid,
            MAX(appointment_date) AS last_visit_date
        FROM appointments
        WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
          AND status NOT IN ('cancelled')
    )
    UPDATE customers
    SET 
        total_visits = stats.total_visits,
        total_spent = stats.total_spent,
        total_paid = stats.total_paid,
        last_visit_date = stats.last_visit_date,
        updated_at = CURRENT_TIMESTAMP
    FROM stats
    WHERE customers.id = COALESCE(NEW.customer_id, OLD.customer_id);

    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_customer_stats() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 244 (class 1259 OID 35824)
-- Name: appointment_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointment_services (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    appointment_id integer NOT NULL,
    service_id integer NOT NULL,
    customer_package_id integer,
    service_price numeric(10,2) NOT NULL,
    estimated_duration_minutes integer NOT NULL,
    is_package_usage boolean DEFAULT false,
    package_discount_applied numeric(10,2) DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    CONSTRAINT appointment_services_service_price_check CHECK ((service_price >= (0)::numeric))
);


ALTER TABLE public.appointment_services OWNER TO postgres;

--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE appointment_services; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.appointment_services IS 'Services included in each appointment with snapshot pricing';


--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN appointment_services.service_price; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.appointment_services.service_price IS 'Snapshot of service price at booking time';


--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN appointment_services.estimated_duration_minutes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.appointment_services.estimated_duration_minutes IS 'Snapshot of estimated duration at booking time';


--
-- TOC entry 243 (class 1259 OID 35823)
-- Name: appointment_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointment_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointment_services_id_seq OWNER TO postgres;

--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 243
-- Name: appointment_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointment_services_id_seq OWNED BY public.appointment_services.id;


--
-- TOC entry 242 (class 1259 OID 35767)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    customer_id integer NOT NULL,
    staff_id integer NOT NULL,
    customer_package_id integer,
    appointment_date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    actual_start_time timestamp with time zone,
    actual_end_time timestamp with time zone,
    status character varying(20) DEFAULT 'scheduled'::character varying NOT NULL,
    total_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0.00,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(50),
    payment_date timestamp with time zone,
    is_package_appointment boolean DEFAULT false,
    booking_source character varying(30),
    check_in_time timestamp with time zone,
    check_out_time timestamp with time zone,
    confirmation_status character varying(20) DEFAULT 'pending'::character varying,
    reminder_sent boolean DEFAULT false,
    customer_notes text,
    staff_notes text,
    cancellation_reason text,
    cancelled_by_user_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    CONSTRAINT appointments_paid_amount_check CHECK ((paid_amount >= (0)::numeric)),
    CONSTRAINT appointments_total_price_check CHECK ((total_price >= (0)::numeric))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE appointments; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.appointments IS 'Appointment bookings with planned and actual times';


--
-- TOC entry 5283 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN appointments.actual_start_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.appointments.actual_start_time IS 'Actual check-in time (can differ from planned)';


--
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN appointments.actual_end_time; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.appointments.actual_end_time IS 'Actual completion time (can differ from planned)';


--
-- TOC entry 241 (class 1259 OID 35766)
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appointments_id_seq OWNER TO postgres;

--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 241
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- TOC entry 218 (class 1259 OID 35369)
-- Name: business_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_types (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);


ALTER TABLE public.business_types OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 35368)
-- Name: business_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.business_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.business_types_id_seq OWNER TO postgres;

--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 217
-- Name: business_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.business_types_id_seq OWNED BY public.business_types.id;


--
-- TOC entry 250 (class 1259 OID 36049)
-- Name: customer_package_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_package_services (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    customer_package_id integer NOT NULL,
    service_id integer NOT NULL,
    total_quantity integer NOT NULL,
    used_quantity integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    CONSTRAINT customer_package_services_check CHECK ((used_quantity <= total_quantity)),
    CONSTRAINT customer_package_services_total_quantity_check CHECK ((total_quantity > 0)),
    CONSTRAINT customer_package_services_used_quantity_check CHECK ((used_quantity >= 0))
);


ALTER TABLE public.customer_package_services OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 36048)
-- Name: customer_package_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_package_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_package_services_id_seq OWNER TO postgres;

--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 249
-- Name: customer_package_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_package_services_id_seq OWNED BY public.customer_package_services.id;


--
-- TOC entry 240 (class 1259 OID 35725)
-- Name: customer_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_packages (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    customer_id integer NOT NULL,
    package_id integer NOT NULL,
    purchase_date date DEFAULT CURRENT_DATE NOT NULL,
    expiry_date date,
    total_sessions integer DEFAULT 1,
    used_sessions integer DEFAULT 0,
    total_price numeric(10,2) NOT NULL,
    custom_price numeric(10,2),
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    next_recommended_session_date date,
    CONSTRAINT customer_packages_custom_price_check CHECK (((custom_price IS NULL) OR (custom_price >= (0)::numeric))),
    CONSTRAINT customer_packages_used_sessions_check CHECK ((used_sessions >= 0))
);


ALTER TABLE public.customer_packages OWNER TO postgres;

--
-- TOC entry 5288 (class 0 OID 0)
-- Dependencies: 240
-- Name: TABLE customer_packages; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.customer_packages IS 'Package purchases by customers with usage tracking';


--
-- TOC entry 239 (class 1259 OID 35724)
-- Name: customer_packages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_packages_id_seq OWNER TO postgres;

--
-- TOC entry 5289 (class 0 OID 0)
-- Dependencies: 239
-- Name: customer_packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_packages_id_seq OWNED BY public.customer_packages.id;


--
-- TOC entry 232 (class 1259 OID 35582)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    user_id integer NOT NULL,
    preferred_staff_id integer,
    notes text,
    total_visits integer DEFAULT 0,
    total_spent numeric(10,2) DEFAULT 0.00,
    total_paid numeric(10,2) DEFAULT 0.00,
    loyalty_points integer DEFAULT 0,
    last_visit_date date,
    marketing_opt_in boolean DEFAULT false,
    whatsapp_opt_in boolean DEFAULT false,
    email_opt_in boolean DEFAULT false,
    source character varying(30),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 232
-- Name: TABLE customers; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.customers IS 'Customer business profiles linked to users';


--
-- TOC entry 231 (class 1259 OID 35581)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 231
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 226 (class 1259 OID 35442)
-- Name: designations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designations (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);


ALTER TABLE public.designations OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 35441)
-- Name: designations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.designations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.designations_id_seq OWNER TO postgres;

--
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 225
-- Name: designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;


--
-- TOC entry 224 (class 1259 OID 35433)
-- Name: otp_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.otp_verifications (
    id integer NOT NULL,
    phone character varying(20) NOT NULL,
    otp character varying(10) NOT NULL,
    purpose character varying(20) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    attempt_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.otp_verifications OWNER TO postgres;

--
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE otp_verifications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.otp_verifications IS 'OTP verification records for phone-based authentication';


--
-- TOC entry 223 (class 1259 OID 35432)
-- Name: otp_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.otp_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.otp_verifications_id_seq OWNER TO postgres;

--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 223
-- Name: otp_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.otp_verifications_id_seq OWNED BY public.otp_verifications.id;


--
-- TOC entry 238 (class 1259 OID 35692)
-- Name: package_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.package_services (
    id integer NOT NULL,
    package_id integer NOT NULL,
    service_id integer NOT NULL,
    quantity integer DEFAULT 1,
    discount_per_service numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);


ALTER TABLE public.package_services OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 35691)
-- Name: package_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.package_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.package_services_id_seq OWNER TO postgres;

--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 237
-- Name: package_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.package_services_id_seq OWNED BY public.package_services.id;


--
-- TOC entry 236 (class 1259 OID 35661)
-- Name: packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.packages (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    total_price numeric(10,2) NOT NULL,
    discount_percentage numeric(5,2) DEFAULT 0,
    validity_days integer,
    display_order integer DEFAULT 0,
    color character varying(7),
    image_url character varying(500),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);


ALTER TABLE public.packages OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 35660)
-- Name: packages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.packages_id_seq OWNER TO postgres;

--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 235
-- Name: packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.packages_id_seq OWNED BY public.packages.id;


--
-- TOC entry 248 (class 1259 OID 36030)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_revoked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 36029)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 247
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 246 (class 1259 OID 35870)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    customer_id integer NOT NULL,
    staff_id integer NOT NULL,
    appointment_id integer,
    rating integer NOT NULL,
    comment text,
    is_public boolean DEFAULT true,
    reply_text text,
    reply_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 246
-- Name: TABLE reviews; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.reviews IS 'Customer reviews for staff members and appointments';


--
-- TOC entry 245 (class 1259 OID 35869)
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 245
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- TOC entry 234 (class 1259 OID 35625)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    category character varying(50),
    estimated_duration_minutes integer NOT NULL,
    price numeric(10,2) NOT NULL,
    display_order integer DEFAULT 0,
    color character varying(7),
    is_online_bookable boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 35624)
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 233
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- TOC entry 228 (class 1259 OID 35472)
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    user_id integer NOT NULL,
    designation_id integer NOT NULL,
    employee_code character varying(50),
    employment_status character varying(20) DEFAULT 'active'::character varying,
    employment_type character varying(20) DEFAULT 'full_time'::character varying,
    experience_years numeric(3,1) DEFAULT 0,
    bio text,
    profile_image_url character varying(500),
    calendar_color character varying(7),
    commission_percentage numeric(5,2) DEFAULT 0,
    is_online_bookable boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    start_time time without time zone,
    end_time time without time zone,
    weekly_off character varying(20)
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 228
-- Name: TABLE staff; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.staff IS 'Staff business profiles linked to users';


--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 228
-- Name: COLUMN staff.calendar_color; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.staff.calendar_color IS 'NULLABLE - optional color for calendar display';


--
-- TOC entry 227 (class 1259 OID 35471)
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_id_seq OWNER TO postgres;

--
-- TOC entry 5303 (class 0 OID 0)
-- Dependencies: 227
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- TOC entry 230 (class 1259 OID 35518)
-- Name: staff_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_services (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    staff_id integer NOT NULL,
    service_id integer NOT NULL,
    custom_price numeric(10,2),
    duration_override integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);


ALTER TABLE public.staff_services OWNER TO postgres;

--
-- TOC entry 5304 (class 0 OID 0)
-- Dependencies: 230
-- Name: TABLE staff_services; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.staff_services IS 'Services each staff member can perform with optional custom price/duration';


--
-- TOC entry 229 (class 1259 OID 35517)
-- Name: staff_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_services_id_seq OWNER TO postgres;

--
-- TOC entry 5305 (class 0 OID 0)
-- Dependencies: 229
-- Name: staff_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_services_id_seq OWNED BY public.staff_services.id;


--
-- TOC entry 220 (class 1259 OID 35382)
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    business_type_id integer NOT NULL,
    phone character varying(20),
    email character varying(150),
    logo_url character varying(500),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    timezone character varying(50) DEFAULT 'Asia/Kolkata'::character varying,
    currency character varying(10) DEFAULT 'INR'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 35381)
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tenants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tenants_id_seq OWNER TO postgres;

--
-- TOC entry 5306 (class 0 OID 0)
-- Dependencies: 219
-- Name: tenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tenants_id_seq OWNED BY public.tenants.id;


--
-- TOC entry 222 (class 1259 OID 35401)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    tenant_id integer,
    full_name character varying(120) NOT NULL,
    phone character varying(20) NOT NULL,
    email character varying(150),
    birthday date,
    gender character varying(20),
    profile_image_url character varying(500),
    preferred_language character varying(10),
    system_role character varying(20) NOT NULL,
    otp_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5307 (class 0 OID 0)
-- Dependencies: 222
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Central identity table for all system users (Owner, Admin, Staff, Customer)';


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN users.email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.email IS 'NULLABLE - phone-only businesses may not collect email';


--
-- TOC entry 221 (class 1259 OID 35400)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4903 (class 2604 OID 35827)
-- Name: appointment_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services ALTER COLUMN id SET DEFAULT nextval('public.appointment_services_id_seq'::regclass);


--
-- TOC entry 4893 (class 2604 OID 35770)
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- TOC entry 4823 (class 2604 OID 35372)
-- Name: business_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types ALTER COLUMN id SET DEFAULT nextval('public.business_types_id_seq'::regclass);


--
-- TOC entry 4916 (class 2604 OID 36052)
-- Name: customer_package_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_package_services ALTER COLUMN id SET DEFAULT nextval('public.customer_package_services_id_seq'::regclass);


--
-- TOC entry 4886 (class 2604 OID 35728)
-- Name: customer_packages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_packages ALTER COLUMN id SET DEFAULT nextval('public.customer_packages_id_seq'::regclass);


--
-- TOC entry 4859 (class 2604 OID 35585)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 4842 (class 2604 OID 35445)
-- Name: designations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);


--
-- TOC entry 4839 (class 2604 OID 35436)
-- Name: otp_verifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_verifications ALTER COLUMN id SET DEFAULT nextval('public.otp_verifications_id_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 35695)
-- Name: package_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package_services ALTER COLUMN id SET DEFAULT nextval('public.package_services_id_seq'::regclass);


--
-- TOC entry 4875 (class 2604 OID 35664)
-- Name: packages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages ALTER COLUMN id SET DEFAULT nextval('public.packages_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 36033)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4908 (class 2604 OID 35873)
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- TOC entry 4869 (class 2604 OID 35628)
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- TOC entry 4847 (class 2604 OID 35475)
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- TOC entry 4856 (class 2604 OID 35521)
-- Name: staff_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services ALTER COLUMN id SET DEFAULT nextval('public.staff_services_id_seq'::regclass);


--
-- TOC entry 4828 (class 2604 OID 35385)
-- Name: tenants id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants ALTER COLUMN id SET DEFAULT nextval('public.tenants_id_seq'::regclass);


--
-- TOC entry 4834 (class 2604 OID 35404)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5265 (class 0 OID 35824)
-- Dependencies: 244
-- Data for Name: appointment_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointment_services (id, tenant_id, appointment_id, service_id, customer_package_id, service_price, estimated_duration_minutes, is_package_usage, package_discount_applied, notes, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	1	11	\N	800.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
2	1	2	3	\N	1500.00	180	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
3	1	3	18	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
4	1	4	18	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
5	1	5	10	\N	2500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
6	1	6	1	\N	500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
7	1	7	5	\N	2500.00	120	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
8	1	8	19	\N	2200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
9	1	9	9	\N	600.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
10	1	10	8	\N	800.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
11	1	11	6	\N	1200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
12	1	12	16	\N	600.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
13	1	13	17	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
14	1	14	10	\N	2500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
15	1	15	14	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
16	1	16	6	\N	1200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
17	1	17	4	\N	300.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
18	1	18	12	\N	1000.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
20	1	20	19	\N	2200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
21	1	21	3	\N	1500.00	180	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
22	1	22	1	\N	500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
23	1	23	17	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
24	1	24	19	\N	2200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
25	1	25	12	\N	1000.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
26	1	26	4	\N	300.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
27	1	27	15	\N	2500.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
28	1	28	7	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
29	1	29	10	\N	2500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
30	1	30	12	\N	1000.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
31	1	31	13	\N	2000.00	90	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
32	1	32	10	\N	2500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
33	1	33	5	\N	2500.00	120	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
34	1	34	2	\N	800.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
35	1	35	14	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
36	1	36	13	\N	2000.00	90	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
37	1	37	17	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
38	1	38	19	\N	2200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
39	1	39	8	\N	800.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
40	1	40	6	\N	1200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
41	1	41	17	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
42	1	42	10	\N	2500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
43	1	43	9	\N	600.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
45	1	45	1	\N	500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
46	1	46	4	\N	300.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
47	1	47	2	\N	800.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
48	1	48	1	\N	500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
49	1	49	10	\N	2500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
50	1	50	2	\N	800.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
51	1	51	6	\N	1200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
52	1	52	10	\N	2500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
53	1	53	4	\N	300.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
54	1	54	13	\N	2000.00	90	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
55	1	55	1	\N	500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
56	1	56	7	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
57	1	57	5	\N	2500.00	120	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
58	1	58	19	\N	2200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
59	1	59	13	\N	2000.00	90	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
60	1	60	6	\N	1200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
61	1	61	3	\N	1500.00	180	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
62	1	62	5	\N	2500.00	120	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
63	1	63	17	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
64	1	64	8	\N	800.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
65	1	65	1	\N	500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
66	1	66	4	\N	300.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
67	1	67	17	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
68	1	68	3	\N	1500.00	180	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
70	1	70	6	\N	1200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
71	1	71	19	\N	2200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
72	1	72	10	\N	2500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
73	1	73	15	\N	2500.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
74	1	74	7	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
75	1	75	11	\N	800.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
76	1	76	10	\N	2500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
77	1	77	7	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
78	1	78	1	\N	500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
79	1	79	16	\N	600.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
80	1	80	11	\N	800.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
81	1	81	1	\N	500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
82	1	82	17	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
83	1	83	8	\N	800.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
84	1	84	7	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
85	1	85	15	\N	2500.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
86	1	86	14	\N	1500.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
87	1	87	7	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
88	1	88	1	\N	500.00	45	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
89	1	89	16	\N	600.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
90	1	90	7	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
91	1	91	13	\N	2000.00	90	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
92	1	92	15	\N	2500.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
93	1	93	19	\N	2200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
94	1	94	11	\N	800.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
95	1	95	15	\N	2500.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
96	1	96	2	\N	800.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
97	1	97	19	\N	2200.00	60	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
98	1	98	16	\N	600.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
99	1	99	9	\N	600.00	30	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
100	1	100	18	\N	2000.00	75	f	0.00	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
113	1	104	14	\N	1500.00	60	\N	0.00	\N	2026-07-29 22:11:48.759775+05:30	\N	2026-07-29 22:11:48.759775+05:30	\N
124	1	102	9	\N	600.00	30	\N	0.00	\N	2026-07-29 23:45:18.778142+05:30	\N	2026-07-29 23:45:18.778142+05:30	\N
127	1	44	14	\N	1500.00	60	\N	0.00	\N	2026-07-30 02:33:46.1355+05:30	\N	2026-07-30 02:33:46.1355+05:30	\N
128	1	105	11	\N	800.00	30	\N	0.00	\N	2026-07-30 02:34:21.304503+05:30	\N	2026-07-30 02:34:21.304503+05:30	\N
129	1	103	11	\N	800.00	30	\N	0.00	\N	2026-07-30 02:34:31.454529+05:30	\N	2026-07-30 02:34:31.454529+05:30	\N
131	1	69	18	\N	2000.00	75	\N	0.00	\N	2026-07-30 02:35:08.267462+05:30	\N	2026-07-30 02:35:08.267462+05:30	\N
136	1	106	6	1	0.00	60	t	0.00	\N	2026-07-30 03:23:48.760096+05:30	\N	2026-07-30 03:23:48.760096+05:30	\N
137	1	106	10	1	0.00	45	t	0.00	\N	2026-07-30 03:23:48.760096+05:30	\N	2026-07-30 03:23:48.760096+05:30	\N
138	1	107	4	\N	300.00	30	\N	0.00	\N	2026-07-30 03:24:23.220073+05:30	\N	2026-07-30 03:24:23.220073+05:30	\N
139	1	19	1	\N	500.00	45	\N	0.00	\N	2026-07-30 16:29:26.745911+05:30	\N	2026-07-30 16:29:26.745911+05:30	\N
140	1	108	6	6	0.00	60	t	0.00	\N	2026-07-30 16:49:46.428329+05:30	\N	2026-07-30 16:49:46.428329+05:30	\N
145	1	112	6	1	0.00	60	t	0.00	\N	2026-07-30 17:20:26.325321+05:30	\N	2026-07-30 17:20:26.325321+05:30	\N
146	1	112	10	1	0.00	45	t	0.00	\N	2026-07-30 17:20:26.325321+05:30	\N	2026-07-30 17:20:26.325321+05:30	\N
147	1	114	6	1	0.00	60	t	0.00	\N	2026-07-30 17:24:44.650263+05:30	\N	2026-07-30 17:24:44.650263+05:30	\N
148	1	115	14	\N	1500.00	60	f	0.00	\N	2026-07-30 17:25:46.955987+05:30	\N	2026-07-30 17:25:46.955987+05:30	\N
\.


--
-- TOC entry 5263 (class 0 OID 35767)
-- Dependencies: 242
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, tenant_id, customer_id, staff_id, customer_package_id, appointment_date, start_time, end_time, actual_start_time, actual_end_time, status, total_price, paid_amount, payment_status, payment_method, payment_date, is_package_appointment, booking_source, check_in_time, check_out_time, confirmation_status, reminder_sent, customer_notes, staff_notes, cancellation_reason, cancelled_by_user_id, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	6	2	\N	2026-08-15	10:30:00	11:00:00	2026-08-15 10:44:00+05:30	2026-08-15 11:13:00+05:30	completed	800.00	0.00	pending	\N	\N	f	phone	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
2	1	1	1	\N	2026-05-18	17:30:00	20:30:00	2026-05-18 17:38:00+05:30	2026-05-18 20:35:00+05:30	completed	1500.00	1500.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
3	1	4	2	\N	2026-08-24	15:30:00	16:45:00	\N	\N	in_progress	2000.00	2000.00	paid	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
4	1	8	1	\N	2026-09-19	16:15:00	17:30:00	\N	\N	cancelled	2000.00	2000.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
5	1	1	3	\N	2026-05-26	10:15:00	11:00:00	\N	\N	in_progress	2500.00	2500.00	paid	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
6	1	2	2	\N	2026-07-17	16:30:00	17:15:00	2026-07-17 16:40:00+05:30	2026-07-17 17:31:00+05:30	completed	500.00	500.00	paid	\N	\N	f	whatsapp	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
7	1	6	2	\N	2026-06-12	10:00:00	12:00:00	2026-06-12 10:06:00+05:30	2026-06-12 12:14:00+05:30	completed	2500.00	2500.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
8	1	1	1	\N	2026-08-07	17:45:00	18:45:00	2026-08-07 17:56:00+05:30	2026-08-07 18:54:00+05:30	completed	2200.00	2200.00	paid	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
9	1	5	3	\N	2026-05-31	10:15:00	10:45:00	\N	\N	in_progress	600.00	600.00	paid	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
10	1	5	2	\N	2026-05-28	10:45:00	11:30:00	\N	\N	in_progress	800.00	0.00	pending	\N	\N	f	walk_in	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
11	1	5	2	\N	2026-07-19	11:00:00	12:00:00	2026-07-19 11:06:00+05:30	2026-07-19 12:07:00+05:30	completed	1200.00	1200.00	paid	\N	\N	f	walk_in	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
12	1	1	2	\N	2026-07-08	16:45:00	17:15:00	\N	\N	scheduled	600.00	0.00	pending	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
13	1	4	1	\N	2026-06-16	11:30:00	12:30:00	2026-06-16 11:31:00+05:30	2026-06-16 12:41:00+05:30	completed	1500.00	1500.00	paid	\N	\N	f	receptionist	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
14	1	4	2	\N	2026-05-31	14:15:00	15:00:00	2026-05-31 14:17:00+05:30	2026-05-31 15:16:00+05:30	completed	2500.00	0.00	pending	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
15	1	7	2	\N	2026-05-08	11:15:00	12:15:00	\N	\N	in_progress	1500.00	0.00	pending	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
16	1	4	1	\N	2026-06-19	13:45:00	14:45:00	\N	\N	scheduled	1200.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
17	1	2	2	\N	2026-04-30	17:45:00	18:15:00	\N	\N	scheduled	300.00	300.00	paid	\N	\N	f	receptionist	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
18	1	4	3	\N	2026-05-12	16:30:00	17:15:00	\N	\N	confirmed	1000.00	1000.00	paid	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
20	1	3	3	\N	2026-10-06	14:30:00	15:30:00	\N	\N	cancelled	2200.00	2200.00	paid	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
21	1	6	1	\N	2026-05-29	15:15:00	18:15:00	\N	\N	confirmed	1500.00	1500.00	paid	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
22	1	3	1	\N	2026-05-18	14:15:00	15:00:00	2026-05-18 14:26:00+05:30	2026-05-18 15:21:00+05:30	completed	500.00	500.00	paid	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
23	1	7	3	\N	2026-05-27	14:30:00	15:30:00	\N	\N	in_progress	1500.00	1500.00	paid	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
24	1	5	1	\N	2026-10-08	13:30:00	14:30:00	\N	\N	scheduled	2200.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
25	1	8	3	\N	2026-05-23	12:45:00	13:30:00	\N	\N	in_progress	1000.00	1000.00	paid	\N	\N	f	phone	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
26	1	5	2	\N	2026-05-30	15:00:00	15:30:00	\N	\N	scheduled	300.00	300.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
27	1	1	1	\N	2026-09-26	15:00:00	15:30:00	2026-09-26 15:14:00+05:30	2026-09-26 15:41:00+05:30	completed	2500.00	2500.00	paid	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
28	1	4	1	\N	2026-08-19	14:30:00	15:45:00	2026-08-19 14:30:00+05:30	2026-08-19 15:59:00+05:30	completed	2000.00	2000.00	paid	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
29	1	7	1	\N	2026-09-08	10:15:00	11:00:00	2026-09-08 10:15:00+05:30	2026-09-08 11:14:00+05:30	completed	2500.00	0.00	pending	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
30	1	3	1	\N	2026-10-02	17:45:00	18:30:00	\N	\N	confirmed	1000.00	0.00	pending	\N	\N	f	phone	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
31	1	1	3	\N	2026-07-01	10:30:00	12:00:00	2026-07-01 10:31:00+05:30	2026-07-01 12:13:00+05:30	completed	2000.00	2000.00	paid	\N	\N	f	receptionist	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
32	1	5	1	\N	2026-09-13	14:45:00	15:30:00	\N	\N	cancelled	2500.00	2500.00	paid	\N	\N	f	receptionist	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
33	1	3	3	\N	2026-05-14	14:00:00	16:00:00	\N	\N	confirmed	2500.00	0.00	pending	\N	\N	f	phone	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
34	1	6	1	\N	2026-08-26	12:15:00	13:15:00	\N	\N	scheduled	800.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
35	1	3	1	\N	2026-07-25	15:15:00	16:15:00	\N	\N	in_progress	1500.00	1500.00	paid	\N	\N	f	whatsapp	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
36	1	5	1	\N	2026-06-27	11:45:00	13:15:00	\N	\N	in_progress	2000.00	0.00	pending	\N	\N	f	walk_in	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
37	1	3	1	\N	2026-06-14	14:15:00	15:15:00	2026-06-14 14:27:00+05:30	2026-06-14 15:38:00+05:30	completed	1500.00	1500.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
38	1	7	3	\N	2026-09-28	17:15:00	18:15:00	2026-09-28 17:23:00+05:30	2026-09-28 18:20:00+05:30	completed	2200.00	0.00	pending	\N	\N	f	receptionist	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
39	1	5	3	\N	2026-06-04	11:00:00	11:45:00	2026-06-04 11:05:00+05:30	2026-06-04 11:47:00+05:30	completed	800.00	800.00	paid	\N	\N	f	phone	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
40	1	4	2	\N	2026-07-14	11:45:00	12:45:00	2026-07-14 11:46:00+05:30	2026-07-14 12:56:00+05:30	completed	1200.00	0.00	pending	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
41	1	1	2	\N	2026-08-07	16:30:00	17:30:00	2026-08-07 16:32:00+05:30	2026-08-07 17:33:00+05:30	completed	1500.00	1500.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
42	1	3	2	\N	2026-09-17	17:00:00	17:45:00	\N	\N	confirmed	2500.00	2500.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
43	1	1	3	\N	2026-06-21	16:15:00	16:45:00	2026-06-21 16:22:00+05:30	2026-06-21 16:48:00+05:30	completed	600.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
45	1	2	2	\N	2026-07-17	11:30:00	12:15:00	\N	\N	in_progress	500.00	500.00	paid	\N	\N	f	walk_in	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
46	1	1	3	\N	2026-07-19	14:30:00	15:00:00	2026-07-19 14:37:00+05:30	2026-07-19 15:02:00+05:30	completed	300.00	300.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
47	1	8	3	\N	2026-07-01	16:45:00	17:45:00	2026-07-01 16:51:00+05:30	2026-07-01 17:50:00+05:30	completed	800.00	0.00	pending	\N	\N	f	whatsapp	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
48	1	8	3	\N	2026-09-23	11:45:00	12:30:00	\N	\N	in_progress	500.00	500.00	paid	\N	\N	f	whatsapp	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
49	1	7	1	\N	2026-10-12	15:00:00	15:45:00	\N	\N	cancelled	2500.00	2500.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
44	1	6	3	\N	2026-09-22	10:45:00	11:45:00	\N	\N	in_progress	1500.00	1500.00	paid	\N	2026-07-30 02:33:46.135+05:30	f	phone	\N	\N	pending	t		\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-30 02:33:46.1355+05:30	\N
50	1	3	3	\N	2026-07-26	14:30:00	15:30:00	2026-07-26 14:33:00+05:30	2026-07-26 15:28:00+05:30	completed	800.00	0.00	pending	\N	\N	f	walk_in	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
51	1	5	1	\N	2026-05-18	15:00:00	16:00:00	2026-05-18 15:09:00+05:30	2026-05-18 16:21:00+05:30	completed	1200.00	1200.00	paid	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
52	1	2	1	\N	2026-08-31	16:30:00	17:15:00	2026-08-31 16:38:00+05:30	2026-08-31 17:36:00+05:30	completed	2500.00	2500.00	paid	\N	\N	f	walk_in	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
53	1	4	3	\N	2026-06-26	14:45:00	15:15:00	2026-06-26 14:54:00+05:30	2026-06-26 15:26:00+05:30	completed	300.00	300.00	paid	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
54	1	6	3	\N	2026-07-14	17:00:00	18:30:00	\N	\N	in_progress	2000.00	0.00	pending	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
55	1	3	3	\N	2026-07-27	10:15:00	11:00:00	\N	\N	confirmed	500.00	500.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
56	1	5	3	\N	2026-05-16	12:15:00	13:30:00	2026-05-16 12:29:00+05:30	2026-05-16 13:42:00+05:30	completed	2000.00	2000.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
57	1	1	1	\N	2026-07-08	13:45:00	15:45:00	\N	\N	scheduled	2500.00	2500.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
58	1	5	3	\N	2026-06-13	11:45:00	12:45:00	\N	\N	confirmed	2200.00	2200.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
59	1	6	1	\N	2026-07-07	15:00:00	16:30:00	2026-07-07 15:04:00+05:30	2026-07-07 16:45:00+05:30	completed	2000.00	2000.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
60	1	7	3	\N	2026-05-10	11:30:00	12:30:00	\N	\N	cancelled	1200.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
61	1	3	3	\N	2026-05-16	10:15:00	13:15:00	\N	\N	cancelled	1500.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
62	1	1	1	\N	2026-06-06	16:00:00	18:00:00	\N	\N	cancelled	2500.00	2500.00	paid	\N	\N	f	walk_in	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
63	1	2	1	\N	2026-06-28	15:15:00	16:15:00	\N	\N	in_progress	1500.00	0.00	pending	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
64	1	6	1	\N	2026-06-09	16:00:00	16:45:00	2026-06-09 16:05:00+05:30	2026-06-09 16:55:00+05:30	completed	800.00	0.00	pending	\N	\N	f	receptionist	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
65	1	5	2	\N	2026-05-04	14:15:00	15:00:00	\N	\N	confirmed	500.00	0.00	pending	\N	\N	f	walk_in	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
66	1	6	1	\N	2026-06-16	12:15:00	12:45:00	2026-06-16 12:28:00+05:30	2026-06-16 12:53:00+05:30	completed	300.00	300.00	paid	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
67	1	6	3	\N	2026-08-04	12:45:00	13:45:00	\N	\N	in_progress	1500.00	1500.00	paid	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
68	1	8	2	\N	2026-06-24	10:00:00	13:00:00	2026-06-24 10:02:00+05:30	2026-06-24 13:12:00+05:30	completed	1500.00	1500.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
70	1	8	3	\N	2026-05-18	11:30:00	12:30:00	\N	\N	cancelled	1200.00	1200.00	paid	\N	\N	f	receptionist	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
71	1	5	1	\N	2026-08-09	10:15:00	11:15:00	\N	\N	in_progress	2200.00	0.00	pending	\N	\N	f	whatsapp	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
72	1	6	2	\N	2026-08-15	10:15:00	11:00:00	\N	\N	cancelled	2500.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
73	1	2	3	\N	2026-08-11	17:15:00	17:45:00	\N	\N	cancelled	2500.00	2500.00	paid	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
74	1	7	1	\N	2026-09-30	14:30:00	15:45:00	\N	\N	confirmed	2000.00	2000.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
75	1	3	1	\N	2026-09-16	12:00:00	12:30:00	\N	\N	scheduled	800.00	0.00	pending	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
76	1	4	3	\N	2026-08-22	11:30:00	12:15:00	\N	\N	cancelled	2500.00	2500.00	paid	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
77	1	4	3	\N	2026-07-01	16:30:00	17:45:00	2026-07-01 16:32:00+05:30	2026-07-01 17:57:00+05:30	completed	2000.00	0.00	pending	\N	\N	f	phone	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
78	1	3	2	\N	2026-09-29	16:30:00	17:15:00	2026-09-29 16:38:00+05:30	2026-09-29 17:26:00+05:30	completed	500.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
79	1	3	2	\N	2026-08-06	14:00:00	14:30:00	\N	\N	cancelled	600.00	600.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
80	1	3	2	\N	2026-06-28	15:00:00	15:30:00	\N	\N	scheduled	800.00	0.00	pending	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
81	1	7	2	\N	2026-06-03	16:00:00	16:45:00	2026-06-03 16:08:00+05:30	2026-06-03 16:53:00+05:30	completed	500.00	500.00	paid	\N	\N	f	walk_in	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
82	1	4	2	\N	2026-07-27	17:30:00	18:30:00	2026-07-27 17:36:00+05:30	2026-07-27 18:44:00+05:30	completed	1500.00	0.00	pending	\N	\N	f	walk_in	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
83	1	1	3	\N	2026-05-27	15:30:00	16:15:00	\N	\N	confirmed	800.00	0.00	pending	\N	\N	f	walk_in	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
84	1	8	2	\N	2026-05-30	12:45:00	14:00:00	2026-05-30 12:56:00+05:30	2026-05-30 14:13:00+05:30	completed	2000.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
85	1	8	3	\N	2026-05-01	11:00:00	11:30:00	\N	\N	confirmed	2500.00	0.00	pending	\N	\N	f	walk_in	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
86	1	4	2	\N	2026-04-30	10:30:00	11:30:00	2026-04-30 10:41:00+05:30	2026-04-30 11:53:00+05:30	completed	1500.00	1500.00	paid	\N	\N	f	whatsapp	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
87	1	8	3	\N	2026-09-20	10:30:00	11:45:00	\N	\N	scheduled	2000.00	2000.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
88	1	2	1	\N	2026-05-12	14:30:00	15:15:00	\N	\N	scheduled	500.00	500.00	paid	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
89	1	2	3	\N	2026-05-20	16:00:00	16:30:00	\N	\N	scheduled	600.00	600.00	paid	\N	\N	f	whatsapp	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
90	1	3	3	\N	2026-07-28	16:30:00	17:45:00	\N	\N	cancelled	2000.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
91	1	5	1	\N	2026-05-16	15:15:00	16:45:00	2026-05-16 15:18:00+05:30	2026-05-16 16:56:00+05:30	completed	2000.00	2000.00	paid	\N	\N	f	receptionist	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
92	1	4	2	\N	2026-10-21	16:15:00	16:45:00	\N	\N	confirmed	2500.00	2500.00	paid	\N	\N	f	receptionist	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
93	1	5	3	\N	2026-07-24	13:45:00	14:45:00	\N	\N	confirmed	2200.00	2200.00	paid	\N	\N	f	customer_portal	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
94	1	7	2	\N	2026-08-21	11:15:00	11:45:00	\N	\N	confirmed	800.00	800.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
95	1	4	1	\N	2026-06-18	17:45:00	18:15:00	\N	\N	in_progress	2500.00	2500.00	paid	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
96	1	4	1	\N	2026-09-19	11:15:00	12:15:00	2026-09-19 11:15:00+05:30	2026-09-19 12:24:00+05:30	completed	800.00	0.00	pending	\N	\N	f	walk_in	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
97	1	4	3	\N	2026-09-21	13:00:00	14:00:00	\N	\N	in_progress	2200.00	0.00	pending	\N	\N	f	phone	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
98	1	5	1	\N	2026-05-01	13:15:00	13:45:00	\N	\N	scheduled	600.00	0.00	pending	\N	\N	f	receptionist	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
99	1	5	3	\N	2026-09-25	11:15:00	11:45:00	\N	\N	in_progress	600.00	0.00	pending	\N	\N	f	customer_portal	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
100	1	6	1	\N	2026-08-20	17:45:00	19:00:00	\N	\N	confirmed	2000.00	0.00	pending	\N	\N	f	walk_in	\N	\N	pending	f	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-28 17:09:38.658625+05:30	1
104	1	9	1	\N	2026-07-29	09:00:00	09:30:00	\N	\N	completed	1500.00	1500.00	paid	\N	2026-07-29 22:11:48.757+05:30	f	\N	\N	\N	pending	f		\N	\N	\N	2026-07-29 22:09:00.627797+05:30	\N	2026-07-29 22:11:48.759775+05:30	\N
102	1	6	1	\N	2026-07-29	10:00:00	10:30:00	\N	\N	cancelled	600.00	0.00	refunded	\N	\N	f	\N	\N	\N	pending	f		\N	\N	\N	2026-07-29 21:46:52.444706+05:30	1	2026-07-29 23:45:18.778142+05:30	\N
105	1	9	1	\N	2026-07-31	11:00:00	11:30:00	\N	\N	scheduled	800.00	800.00	paid	\N	2026-07-30 02:34:21.303+05:30	f	\N	\N	\N	pending	f		\N	\N	\N	2026-07-29 22:17:37.443437+05:30	\N	2026-07-30 02:34:21.304503+05:30	\N
103	1	9	1	\N	2026-07-28	13:30:00	14:00:00	\N	\N	in_progress	800.00	800.00	paid	\N	2026-07-30 02:34:31.453+05:30	f	\N	\N	\N	pending	f		\N	\N	\N	2026-07-29 21:56:48.135066+05:30	\N	2026-07-30 02:34:31.454529+05:30	\N
69	1	7	1	\N	2026-07-30	16:45:00	18:00:00	\N	\N	cancelled	0.00	0.00	refunded	\N	\N	f	receptionist	\N	\N	pending	t		\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-30 02:35:08.267462+05:30	\N
106	1	6	1	1	2026-07-30	09:00:00	10:45:00	\N	\N	in_progress	0.00	0.00	paid	\N	\N	t	\N	\N	\N	pending	f		\N	\N	\N	2026-07-30 03:23:29.362526+05:30	\N	2026-07-30 03:23:48.760096+05:30	\N
107	1	9	2	\N	2026-07-30	09:00:00	09:30:00	\N	\N	scheduled	300.00	300.00	paid	\N	2026-07-30 03:24:23.218+05:30	f	\N	\N	\N	pending	f		\N	\N	\N	2026-07-30 03:24:23.220073+05:30	\N	2026-07-30 03:24:23.220073+05:30	\N
19	1	7	2	\N	2026-07-30	11:30:00	12:15:00	\N	\N	confirmed	500.00	500.00	paid	\N	2026-07-30 16:29:26.74+05:30	f	walk_in	\N	\N	pending	t	\N	\N	\N	\N	2026-07-28 17:09:38.658625+05:30	1	2026-07-30 16:29:26.745911+05:30	\N
108	1	4	1	6	2026-07-30	11:00:00	12:00:00	\N	\N	scheduled	0.00	0.00	pending	\N	\N	t	\N	\N	\N	pending	f	\N	\N	\N	\N	2026-07-30 16:49:46.428329+05:30	\N	2026-07-30 16:49:46.428329+05:30	\N
112	1	6	1	1	2026-07-30	13:45:00	15:30:00	\N	\N	scheduled	0.00	0.00	pending	\N	\N	t	\N	\N	\N	pending	f	\N	\N	\N	\N	2026-07-30 17:20:26.325321+05:30	\N	2026-07-30 17:20:26.325321+05:30	\N
114	1	6	3	1	2026-07-30	10:00:00	11:00:00	\N	\N	scheduled	0.00	0.00	pending	\N	\N	t	\N	\N	\N	pending	f	\N	\N	\N	\N	2026-07-30 17:24:44.650263+05:30	\N	2026-07-30 17:24:44.650263+05:30	\N
115	1	9	4	\N	2026-07-30	09:15:00	10:15:00	\N	\N	completed	1500.00	1500.00	paid	\N	2026-07-30 17:25:46.954+05:30	f	\N	\N	\N	pending	f	\N	\N	\N	\N	2026-07-30 17:25:46.955987+05:30	\N	2026-07-30 17:25:46.955987+05:30	\N
\.


--
-- TOC entry 5239 (class 0 OID 35369)
-- Dependencies: 218
-- Data for Name: business_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_types (id, name, description, display_order, is_active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	Salon	Hair, beauty, and grooming services	1	t	2026-07-28 17:04:37.933256+05:30	\N	2026-07-28 17:04:37.933256+05:30	\N
2	Dermatology Clinic	Medical skin care and treatments	2	t	2026-07-28 17:04:37.933256+05:30	\N	2026-07-28 17:04:37.933256+05:30	\N
3	Spa	Wellness, massage, and relaxation services	3	t	2026-07-28 17:04:37.933256+05:30	\N	2026-07-28 17:04:37.933256+05:30	\N
4	Nail Studio	Nail care and art services	4	t	2026-07-28 17:04:37.933256+05:30	\N	2026-07-28 17:04:37.933256+05:30	\N
5	Barbershop	Traditional barber services	5	t	2026-07-28 17:04:37.933256+05:30	\N	2026-07-28 17:04:37.933256+05:30	\N
6	Aesthetic Clinic	Cosmetic and aesthetic treatments	6	t	2026-07-28 17:04:37.933256+05:30	\N	2026-07-28 17:04:37.933256+05:30	\N
\.


--
-- TOC entry 5271 (class 0 OID 36049)
-- Dependencies: 250
-- Data for Name: customer_package_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_package_services (id, tenant_id, customer_package_id, service_id, total_quantity, used_quantity, created_at, created_by, updated_at, updated_by) FROM stdin;
3	1	6	6	1	0	2026-07-30 16:45:14.562565+05:30	3	2026-07-30 16:45:14.562565+05:30	\N
4	1	6	11	1	0	2026-07-30 16:45:14.562565+05:30	3	2026-07-30 16:45:14.562565+05:30	\N
5	1	6	17	1	0	2026-07-30 16:45:14.562565+05:30	3	2026-07-30 16:45:14.562565+05:30	\N
1	1	1	10	2	1	2026-07-30 15:46:44.914516+05:30	\N	2026-07-30 17:20:26.325321+05:30	\N
2	1	1	6	3	2	2026-07-30 15:46:44.914516+05:30	\N	2026-07-30 17:24:44.650263+05:30	\N
\.


--
-- TOC entry 5261 (class 0 OID 35725)
-- Dependencies: 240
-- Data for Name: customer_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_packages (id, tenant_id, customer_id, package_id, purchase_date, expiry_date, total_sessions, used_sessions, total_price, custom_price, payment_status, created_at, created_by, updated_at, updated_by, next_recommended_session_date) FROM stdin;
6	1	4	3	2026-07-30	2027-07-30	3	0	3000.00	\N	paid	2026-07-30 16:45:14.562565+05:30	3	2026-07-30 16:45:14.562565+05:30	\N	\N
1	1	6	1	2026-07-30	2027-11-30	5	3	5000.00	4000.00	paid	2026-07-30 02:54:08.067107+05:30	3	2026-07-30 02:54:08.067107+05:30	\N	\N
\.


--
-- TOC entry 5253 (class 0 OID 35582)
-- Dependencies: 232
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, tenant_id, user_id, preferred_staff_id, notes, total_visits, total_spent, total_paid, loyalty_points, last_visit_date, marketing_opt_in, whatsapp_opt_in, email_opt_in, source, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	3	\N	\N	11	17000.00	15000.00	0	2026-09-26	f	f	f	customer_portal	2026-07-28 17:09:01.562506+05:30	1	2026-07-28 17:09:01.562506+05:30	1
2	1	4	\N	\N	7	6400.00	4900.00	0	2026-08-31	f	f	f	customer_portal	2026-07-28 17:09:01.562506+05:30	1	2026-07-28 17:09:01.562506+05:30	1
3	1	5	\N	\N	11	12900.00	6500.00	0	2026-10-02	f	f	f	customer_portal	2026-07-28 17:09:01.562506+05:30	1	2026-07-28 17:09:01.562506+05:30	1
5	1	7	\N	\N	16	21400.00	12500.00	0	2026-10-08	f	f	f	customer_portal	2026-07-28 17:09:01.562506+05:30	1	2026-07-28 17:09:01.562506+05:30	1
8	1	10	\N	\N	7	10300.00	5000.00	0	2026-09-23	f	f	f	customer_portal	2026-07-28 17:09:01.562506+05:30	1	2026-07-28 17:09:01.562506+05:30	1
7	1	9	\N	\N	8	11500.00	5300.00	0	2026-09-30	f	f	f	customer_portal	2026-07-28 17:09:01.562506+05:30	1	2026-07-30 16:29:26.745911+05:30	1
4	1	6	\N	\N	16	24700.00	13300.00	0	2026-10-21	f	f	f	customer_portal	2026-07-28 17:09:01.562506+05:30	1	2026-07-30 16:49:46.428329+05:30	1
6	1	8	\N	\N	14	15700.00	9300.00	0	2026-09-22	f	f	f	customer_portal	2026-07-28 17:09:01.562506+05:30	1	2026-07-30 17:24:44.650263+05:30	1
9	1	15	\N		5	4900.00	4900.00	0	2026-07-31	f	f	f	\N	2026-07-29 21:56:43.088326+05:30	3	2026-07-30 17:25:46.955987+05:30	3
\.


--
-- TOC entry 5247 (class 0 OID 35442)
-- Dependencies: 226
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.designations (id, tenant_id, name, description, display_order, is_active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	Hair Stylist	Professional hair cutting and styling	1	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
2	1	Senior Hair Stylist	Expert hair cutting, coloring, and styling	2	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
3	1	Nail Artist	Professional nail care and art	3	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
4	1	Senior Nail Artist	Expert nail care and advanced nail art	4	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
5	1	Beautician	General beauty and grooming services	5	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
6	1	Esthetician	Skin care and facial treatments	6	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
7	1	Senior Esthetician	Advanced skin care and facial treatments	7	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
8	1	Massage Therapist	Professional massage and bodywork	8	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
9	1	Laser Specialist	Laser hair removal and skin treatments	9	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
10	1	Dermatologist	Medical skin care and treatments	10	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
11	1	Senior Dermatologist	Advanced medical skin care and treatments	11	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
12	1	Receptionist	Front desk and customer service	12	t	2026-07-28 17:05:00.622596+05:30	1	2026-07-28 17:05:00.622596+05:30	1
\.


--
-- TOC entry 5245 (class 0 OID 35433)
-- Dependencies: 224
-- Data for Name: otp_verifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.otp_verifications (id, phone, otp, purpose, expires_at, verified_at, attempt_count, created_at) FROM stdin;
1	9876543210	702128	login	2026-07-28 21:35:16.053+05:30	2026-07-28 21:31:46.857667+05:30	0	2026-07-28 21:30:28.191459+05:30
2	9876543210	926089	login	2026-07-28 22:16:27.272+05:30	\N	0	2026-07-28 22:11:27.27887+05:30
3	9876543210	653886	login	2026-07-28 22:16:38.54+05:30	2026-07-28 22:11:53.550492+05:30	0	2026-07-28 22:11:38.546234+05:30
4	9876543210	341102	login	2026-07-28 22:45:27.011+05:30	2026-07-28 22:40:52.612899+05:30	0	2026-07-28 22:40:27.016297+05:30
5	9876543210	920996	login	2026-07-28 22:52:59.321+05:30	2026-07-28 22:48:10.825889+05:30	0	2026-07-28 22:47:59.326419+05:30
6	9876543210	694515	login	2026-07-29 00:19:26.463+05:30	2026-07-29 00:14:37.735862+05:30	0	2026-07-29 00:14:26.468728+05:30
7	9876543210	408250	login	2026-07-29 01:43:29.394+05:30	2026-07-29 01:38:35.935623+05:30	0	2026-07-29 01:38:29.39657+05:30
8	9876543210	296785	login	2026-07-29 01:45:58.645+05:30	2026-07-29 01:41:06.621688+05:30	0	2026-07-29 01:40:58.646174+05:30
9	9876543210	726188	login	2026-07-29 02:13:46.715+05:30	2026-07-29 02:08:55.708404+05:30	0	2026-07-29 02:08:46.71706+05:30
10	9876543210	452691	login	2026-07-29 02:31:14.149+05:30	2026-07-29 02:26:20.382501+05:30	0	2026-07-29 02:26:14.149878+05:30
11	9876543210	640083	login	2026-07-29 02:51:49.852+05:30	2026-07-29 02:47:20.944818+05:30	1	2026-07-29 02:46:49.85316+05:30
12	9876543210	536357	login	2026-07-29 15:47:03.9+05:30	2026-07-29 15:42:17.203651+05:30	0	2026-07-29 15:42:03.903984+05:30
13	9876543210	893605	login	2026-07-29 16:54:16.463+05:30	2026-07-29 16:49:28.081842+05:30	0	2026-07-29 16:49:16.467501+05:30
14	9876543210	182161	login	2026-07-29 17:16:11.064+05:30	\N	0	2026-07-29 17:11:11.067088+05:30
15	9876543210	504118	login	2026-07-29 17:16:47.473+05:30	2026-07-29 17:11:54.090399+05:30	0	2026-07-29 17:11:47.474758+05:30
16	9876543210	837661	login	2026-07-29 17:48:48.122+05:30	2026-07-29 17:44:00.978+05:30	0	2026-07-29 17:43:48.125495+05:30
17	9876543210	293918	login	2026-07-29 18:39:15.354+05:30	2026-07-29 18:34:23.733668+05:30	0	2026-07-29 18:34:15.358176+05:30
18	9876543210	770037	login	2026-07-29 19:29:54.415+05:30	2026-07-29 19:25:00.590995+05:30	0	2026-07-29 19:24:54.418939+05:30
19	9876543210	185526	login	2026-07-29 19:53:07.034+05:30	2026-07-29 19:48:15.604471+05:30	0	2026-07-29 19:48:07.036529+05:30
20	9876543210	161184	login	2026-07-29 20:09:04.188+05:30	2026-07-29 20:04:10.011336+05:30	0	2026-07-29 20:04:04.194728+05:30
21	9876543210	921094	login	2026-07-29 20:27:09.177+05:30	2026-07-29 20:22:17.811953+05:30	0	2026-07-29 20:22:09.17968+05:30
22	9876543210	706754	login	2026-07-29 20:50:35.605+05:30	2026-07-29 20:45:42.745206+05:30	0	2026-07-29 20:45:35.607255+05:30
23	9876543210	318297	login	2026-07-29 21:18:20.858+05:30	2026-07-29 21:13:31.13859+05:30	0	2026-07-29 21:13:20.860663+05:30
24	9876543210	423040	login	2026-07-29 21:42:22.689+05:30	2026-07-29 21:37:31.40962+05:30	0	2026-07-29 21:37:22.697841+05:30
25	9876543210	670692	login	2026-07-29 21:58:45.634+05:30	2026-07-29 21:53:53.258492+05:30	0	2026-07-29 21:53:45.637843+05:30
26	9876543210	771435	login	2026-07-29 22:34:38.511+05:30	2026-07-29 22:29:44.397156+05:30	0	2026-07-29 22:29:38.513609+05:30
27	9876543210	240257	login	2026-07-29 23:03:36.836+05:30	2026-07-29 22:58:41.821457+05:30	0	2026-07-29 22:58:36.838547+05:30
28	9876543210	991210	login	2026-07-29 23:31:21.345+05:30	2026-07-29 23:26:33.670215+05:30	0	2026-07-29 23:26:21.348386+05:30
29	9876543210	264604	login	2026-07-29 23:49:01.047+05:30	2026-07-29 23:44:08.751254+05:30	0	2026-07-29 23:44:01.048776+05:30
30	9876543210	854829	login	2026-07-30 02:26:07.836+05:30	2026-07-30 02:21:18.817881+05:30	0	2026-07-30 02:21:07.838101+05:30
31	9876543210	853201	login	2026-07-30 14:55:53.067+05:30	2026-07-30 14:50:58.248422+05:30	0	2026-07-30 14:50:53.076824+05:30
32	9876543210	614319	login	2026-07-30 15:27:15.769+05:30	2026-07-30 15:22:25.571231+05:30	0	2026-07-30 15:22:15.771389+05:30
33	9876543210	214792	login	2026-07-30 15:44:07.54+05:30	2026-07-30 15:39:15.680199+05:30	0	2026-07-30 15:39:07.541946+05:30
34	9876543210	635730	login	2026-07-30 16:33:47.427+05:30	2026-07-30 16:28:57.943879+05:30	0	2026-07-30 16:28:47.430997+05:30
35	9876543210	958319	login	2026-07-30 17:21:53.163+05:30	2026-07-30 17:16:58.47679+05:30	0	2026-07-30 17:16:53.169203+05:30
\.


--
-- TOC entry 5259 (class 0 OID 35692)
-- Dependencies: 238
-- Data for Name: package_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.package_services (id, package_id, service_id, quantity, discount_per_service, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	6	3	0.00	2026-07-28 17:09:21.254223+05:30	1	2026-07-28 17:09:21.254223+05:30	1
2	1	10	2	0.00	2026-07-28 17:09:21.254223+05:30	1	2026-07-28 17:09:21.254223+05:30	1
7	3	6	1	0.00	2026-07-28 17:09:21.254223+05:30	1	2026-07-28 17:09:21.254223+05:30	1
8	3	11	1	0.00	2026-07-28 17:09:21.254223+05:30	1	2026-07-28 17:09:21.254223+05:30	1
9	3	17	1	0.00	2026-07-28 17:09:21.254223+05:30	1	2026-07-28 17:09:21.254223+05:30	1
13	2	11	1	0.00	2026-07-30 02:49:18.451053+05:30	3	2026-07-30 02:49:18.451053+05:30	\N
14	2	12	1	0.00	2026-07-30 02:49:18.451053+05:30	3	2026-07-30 02:49:18.451053+05:30	\N
15	2	2	1	0.00	2026-07-30 02:49:18.451053+05:30	3	2026-07-30 02:49:18.451053+05:30	\N
\.


--
-- TOC entry 5257 (class 0 OID 35661)
-- Dependencies: 236
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.packages (id, tenant_id, name, description, total_price, discount_percentage, validity_days, display_order, color, image_url, is_active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	Glow Package	3 Facials + 2 Chemical Peels at 15% off	5000.00	15.00	90	1	\N	\N	t	2026-07-28 17:09:09.708062+05:30	1	2026-07-28 17:09:09.708062+05:30	1
3	1	Monthly Wellness	1 Massage + 1 Facial + 1 Manicure per month	3000.00	10.00	30	3	\N	\N	t	2026-07-28 17:09:09.708062+05:30	1	2026-07-28 17:09:09.708062+05:30	1
2	1	Bridal Package	Hair Color + Facial + Manicure + Pedicure	1950.00	25.00	180	2	\N	\N	t	2026-07-28 17:09:09.708062+05:30	1	2026-07-30 02:49:18.451053+05:30	3
\.


--
-- TOC entry 5269 (class 0 OID 36030)
-- Dependencies: 248
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, is_revoked, created_at, updated_at) FROM stdin;
1	3	ef064434100191c58802fda29842532bf8f4df6558469d67b334696d62583b75	2026-08-28 23:26:33.709+05:30	t	2026-07-29 23:26:33.710832+05:30	2026-07-30 15:38:55.770565+05:30
2	3	53865213afad17908f4bc764a4483f7346eaec517d89ccacf55bc2f6f2dfdb55	2026-08-28 23:43:23.503+05:30	t	2026-07-29 23:43:23.512604+05:30	2026-07-30 15:38:55.770565+05:30
3	3	9f030654e075984c03badcd0c6ab688c18e1e071219bbb896eaaea8d7e2ab80b	2026-08-28 23:44:08.777+05:30	t	2026-07-29 23:44:08.778015+05:30	2026-07-30 15:38:55.770565+05:30
4	3	cc0b8b22d0c28e95e6a5f0e8d9c7e6654ec3ae728f6689a52f95e59a18383d59	2026-08-29 02:21:18.834+05:30	t	2026-07-30 02:21:18.83494+05:30	2026-07-30 15:38:55.770565+05:30
5	3	04e63644858e1fb8a22b1902908ee510637b895f099a59bd4295f87d9d52e81f	2026-08-29 02:45:15.086+05:30	t	2026-07-30 02:45:15.087726+05:30	2026-07-30 15:38:55.770565+05:30
6	3	0d58a3ed5e1b10398b008433d3819c1caecd8888342e956ec8a2976c840acf17	2026-08-29 03:03:01.998+05:30	t	2026-07-30 03:03:01.999637+05:30	2026-07-30 15:38:55.770565+05:30
7	3	ec1ef57f1efe8542cf74c2efd1d7a7e1958505fa5b395813e246358ae5e9face	2026-08-29 03:18:45.477+05:30	t	2026-07-30 03:18:45.478225+05:30	2026-07-30 15:38:55.770565+05:30
8	3	7a4409fce662d429eb5966f5ceea4b56aa513dbf6bc0dec03c1ff14e4952b926	2026-08-29 04:10:25.36+05:30	t	2026-07-30 04:10:25.363993+05:30	2026-07-30 15:38:55.770565+05:30
9	3	4602f2b619054cc657bd35b3023083ad4436307359d0c521e8110f02e5fa69dd	2026-08-29 14:50:58.405+05:30	t	2026-07-30 14:50:58.413211+05:30	2026-07-30 15:38:55.770565+05:30
10	3	82ee7e83a4dcce01ac851fd4f7642e57a2857bba4294abf5da2d7f1dfaab9c4f	2026-08-29 15:22:02.916+05:30	t	2026-07-30 15:22:02.918366+05:30	2026-07-30 15:38:55.770565+05:30
11	3	f1a12b4ba64163614662e4c30e717e35afe9fd8d334d85f722152f93868d4d0e	2026-08-29 15:22:25.61+05:30	t	2026-07-30 15:22:25.612973+05:30	2026-07-30 15:38:55.770565+05:30
12	3	386b5b7414edfbc59f9c7f3d8fcfc98f010ec488ce482065ed7c99e54a4101d5	2026-08-29 15:38:55.003+05:30	t	2026-07-30 15:38:55.00525+05:30	2026-07-30 15:38:55.770565+05:30
13	3	3057f062a4f0ed957e0e6ee40cc37db5d1f39b1eb66c3a264f631e596e5c27c8	2026-08-29 15:39:15.73+05:30	t	2026-07-30 15:39:15.731617+05:30	2026-07-30 16:28:40.642433+05:30
14	3	43954abd700553020827ff08439ef083195f0a15347450dbff43a6f7600879fd	2026-08-29 16:28:40.664+05:30	f	2026-07-30 16:28:40.668655+05:30	2026-07-30 16:28:40.668655+05:30
16	3	bf98fb441e783873de5a82a047dc60ee46eae1a601a902a2c22f0e23ed3d2e58	2026-08-29 16:28:57.978+05:30	t	2026-07-30 16:28:57.982423+05:30	2026-07-30 16:44:44.897931+05:30
17	3	cca907e9a7a47c73a9638d74c561e8a17edb15d5ffcc7e909c9925b40993b3f5	2026-08-29 16:44:44.926+05:30	f	2026-07-30 16:44:44.929829+05:30	2026-07-30 16:44:44.929829+05:30
18	3	7803f54d951bfc11afb9aaade924dadecf43585218ad8797349072115e674e70	2026-08-29 17:16:58.553+05:30	f	2026-07-30 17:16:58.558328+05:30	2026-07-30 17:16:58.558328+05:30
\.


--
-- TOC entry 5267 (class 0 OID 35870)
-- Dependencies: 246
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, tenant_id, customer_id, staff_id, appointment_id, rating, comment, is_public, reply_text, reply_date, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	4	2	14	3	Amazing service! Highly recommend.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
2	1	2	1	52	3	Amazing service! Highly recommend.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
3	1	1	1	2	3	Amazing service! Highly recommend.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
4	1	8	2	84	3	Amazing service! Highly recommend.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
5	1	1	2	41	3	Amazing service! Highly recommend.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
6	1	1	3	31	3	Amazing service! Highly recommend.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
7	1	4	2	82	3	Very professional and friendly staff.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
8	1	1	1	8	3	Very professional and friendly staff.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
9	1	2	2	6	3	Very professional and friendly staff.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
10	1	8	3	47	3	Very professional and friendly staff.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
11	1	4	1	96	4	Great experience, will definitely come back.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
12	1	6	2	1	4	Great experience, will definitely come back.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
13	1	3	3	50	4	Great experience, will definitely come back.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
14	1	5	1	91	4	Great experience, will definitely come back.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
15	1	6	1	66	4	Great experience, will definitely come back.	t	\N	\N	2026-07-28 17:09:47.861927+05:30	1	2026-07-28 17:09:47.861927+05:30	1
\.


--
-- TOC entry 5255 (class 0 OID 35625)
-- Dependencies: 234
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, tenant_id, name, description, category, estimated_duration_minutes, price, display_order, color, is_online_bookable, is_active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	1	Hair Cut	Professional haircut and styling	Hair	45	500.00	1	#FF6B6B	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
2	1	Hair Spa	Deep conditioning and scalp treatment	Hair	60	800.00	2	#FF6B6B	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
3	1	Hair Coloring	Full hair coloring service	Hair	180	1500.00	3	#FF6B6B	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
4	1	Hair Wash	Hair wash and blow dry	Hair	30	300.00	4	#FF6B6B	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
5	1	Hair Smoothening	Hair smoothening and straightening	Hair	120	2500.00	5	#FF6B6B	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
6	1	Facial	Deep cleansing and hydrating facial	Skin	60	1200.00	6	#4ECDC4	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
7	1	Hydra Facial	Advanced hydrating facial treatment	Skin	75	2000.00	7	#4ECDC4	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
8	1	Cleanup	Deep pore cleansing and exfoliation	Skin	45	800.00	8	#4ECDC4	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
9	1	Detan	Skin brightening and tan removal	Skin	30	600.00	9	#4ECDC4	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
10	1	Chemical Peel	Skin rejuvenation peel treatment	Skin	45	2500.00	10	#4ECDC4	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
11	1	Manicure	Basic manicure and nail care	Nails	30	800.00	11	#45B7D1	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
12	1	Pedicure	Basic pedicure and foot care	Nails	45	1000.00	12	#45B7D1	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
13	1	Nail Extensions	Acrylic or gel nail extensions	Nails	90	2000.00	13	#45B7D1	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
14	1	Nail Art	Custom nail art and designs	Nails	60	1500.00	14	#45B7D1	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
15	1	Laser Hair Removal	Laser hair removal session	Laser	30	2500.00	15	#96CEB4	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
16	1	Head Massage	Relaxing head and scalp massage	Massage	30	600.00	16	#DDA0DD	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
17	1	Body Massage	Full body relaxation massage	Massage	60	1500.00	17	#DDA0DD	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
18	1	Aromatherapy Massage	Aromatherapy oil massage	Massage	75	2000.00	18	#DDA0DD	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
19	1	Deep Tissue Massage	Deep tissue and sports massage	Massage	60	2200.00	19	#DDA0DD	t	t	2026-07-28 17:05:17.222629+05:30	1	2026-07-28 17:05:17.222629+05:30	1
\.


--
-- TOC entry 5249 (class 0 OID 35472)
-- Dependencies: 228
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, tenant_id, user_id, designation_id, employee_code, employment_status, employment_type, experience_years, bio, profile_image_url, calendar_color, commission_percentage, is_online_bookable, is_active, created_at, created_by, updated_at, updated_by, start_time, end_time, weekly_off) FROM stdin;
2	1	5	8	EMP002	active	full_time	3.0	\N	\N	#FF6B6B	0.00	t	t	2026-07-28 17:06:59.437874+05:30	1	2026-07-28 17:06:59.437874+05:30	1	\N	\N	\N
3	1	6	7	EMP003	active	full_time	3.0	\N	\N	#FF6B6B	0.00	t	t	2026-07-28 17:06:59.437874+05:30	1	2026-07-28 17:06:59.437874+05:30	1	\N	\N	\N
4	1	12	1	EMP004	active	full_time	0.0	\N	\N	\N	2.00	t	t	2026-07-29 20:10:03.996296+05:30	\N	2026-07-29 20:10:03.996296+05:30	\N	11:00:00	20:00:00	Friday
1	1	4	1	EMP001	active	full_time	3.0	\N	\N	#FF6B6B	10.00	t	t	2026-07-28 17:06:59.437874+05:30	1	2026-07-29 17:12:17.172457+05:30	\N	11:00:00	20:00:00	Sunday
\.


--
-- TOC entry 5251 (class 0 OID 35518)
-- Dependencies: 230
-- Data for Name: staff_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_services (id, tenant_id, staff_id, service_id, custom_price, duration_override, created_at, created_by, updated_at, updated_by) FROM stdin;
77	1	4	1	\N	\N	2026-07-29 20:10:03.996296+05:30	3	2026-07-29 20:10:03.996296+05:30	\N
78	1	1	8	\N	\N	2026-07-29 20:35:05.391876+05:30	\N	2026-07-29 20:35:05.391876+05:30	\N
79	1	1	9	\N	\N	2026-07-29 20:35:05.391876+05:30	\N	2026-07-29 20:35:05.391876+05:30	\N
80	1	1	12	\N	\N	2026-07-29 20:35:05.391876+05:30	\N	2026-07-29 20:35:05.391876+05:30	\N
5	1	2	6	\N	\N	2026-07-28 17:08:31.84969+05:30	1	2026-07-28 17:08:31.84969+05:30	1
6	1	2	7	\N	\N	2026-07-28 17:08:31.84969+05:30	1	2026-07-28 17:08:31.84969+05:30	1
7	1	2	8	\N	\N	2026-07-28 17:08:31.84969+05:30	1	2026-07-28 17:08:31.84969+05:30	1
8	1	2	10	\N	\N	2026-07-28 17:08:31.84969+05:30	1	2026-07-28 17:08:31.84969+05:30	1
9	1	3	1	\N	\N	2026-07-28 17:08:31.84969+05:30	1	2026-07-28 17:08:31.84969+05:30	1
10	1	3	2	\N	\N	2026-07-28 17:08:31.84969+05:30	1	2026-07-28 17:08:31.84969+05:30	1
11	1	3	3	\N	\N	2026-07-28 17:08:31.84969+05:30	1	2026-07-28 17:08:31.84969+05:30	1
12	1	3	5	\N	\N	2026-07-28 17:08:31.84969+05:30	1	2026-07-28 17:08:31.84969+05:30	1
81	1	1	13	\N	\N	2026-07-29 20:35:05.391876+05:30	\N	2026-07-29 20:35:05.391876+05:30	\N
82	1	1	16	\N	\N	2026-07-29 20:35:05.391876+05:30	\N	2026-07-29 20:35:05.391876+05:30	\N
83	1	1	17	\N	\N	2026-07-29 20:35:05.391876+05:30	\N	2026-07-29 20:35:05.391876+05:30	\N
84	1	1	18	\N	\N	2026-07-29 20:35:05.391876+05:30	\N	2026-07-29 20:35:05.391876+05:30	\N
85	1	1	19	\N	\N	2026-07-29 20:35:05.391876+05:30	\N	2026-07-29 20:35:05.391876+05:30	\N
\.


--
-- TOC entry 5241 (class 0 OID 35382)
-- Dependencies: 220
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, business_type_id, phone, email, logo_url, address, city, state, country, postal_code, timezone, currency, is_active, created_at, created_by, updated_at, updated_by) FROM stdin;
1	GlowLogic Demo	1	9999999999	demo@glowlogic.com	\N	\N	\N	\N	\N	\N	Asia/Kolkata	INR	t	2026-07-28 17:04:37.933256+05:30	1	2026-07-28 17:04:37.933256+05:30	1
\.


--
-- TOC entry 5243 (class 0 OID 35401)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, tenant_id, full_name, phone, email, birthday, gender, profile_image_url, preferred_language, system_role, otp_verified, is_active, last_login_at, created_at, created_by, updated_at, updated_by) FROM stdin;
1	\N	System	0000000000	system@glowlogic.com	\N	\N	\N	\N	System	t	t	\N	2026-07-28 17:04:37.933256+05:30	\N	2026-07-28 17:04:37.933256+05:30	\N
2	1	Demo Owner	9999999999	owner@glowlogic.com	\N	\N	\N	\N	Owner	t	t	\N	2026-07-28 17:04:51.21817+05:30	1	2026-07-28 17:04:51.21817+05:30	1
5	1	John Smith	9876543212	john@email.com	1985-12-01	male	\N	\N	Customer	t	t	\N	2026-07-28 17:06:44.274473+05:30	1	2026-07-28 17:06:44.274473+05:30	1
6	1	Michael Brown	9876543213	michael@email.com	1992-07-18	male	\N	\N	Customer	t	t	\N	2026-07-28 17:06:44.274473+05:30	1	2026-07-28 17:06:44.274473+05:30	1
7	1	Olivia Wilson	9876543214	olivia@email.com	1995-03-30	female	\N	\N	Customer	t	t	\N	2026-07-28 17:06:44.274473+05:30	1	2026-07-28 17:06:44.274473+05:30	1
8	1	David Miller	9876543215	david@email.com	1987-11-12	male	\N	\N	Customer	t	t	\N	2026-07-28 17:06:44.274473+05:30	1	2026-07-28 17:06:44.274473+05:30	1
9	1	Emma Jones	9876543216	emma@email.com	1993-06-25	female	\N	\N	Customer	t	t	\N	2026-07-28 17:06:44.274473+05:30	1	2026-07-28 17:06:44.274473+05:30	1
10	1	James Garcia	9876543217	james@email.com	1991-08-09	male	\N	\N	Customer	t	t	\N	2026-07-28 17:06:44.274473+05:30	1	2026-07-28 17:06:44.274473+05:30	1
15	1	saba	9910821171		\N	\N	\N	\N	customer	f	t	\N	2026-07-29 21:56:43.088326+05:30	3	2026-07-29 22:19:12.598415+05:30	3
3	1	Sarah Johnson	9876543210	sarah@email.com	1990-05-15	female	\N	\N	Customer	t	t	2026-07-30 17:16:58.549624+05:30	2026-07-28 17:06:44.274473+05:30	1	2026-07-30 17:16:58.549624+05:30	1
12	1	new staff	9910821170	\N	\N	\N	\N	\N	Staff	f	t	\N	2026-07-29 20:10:03.996296+05:30	3	2026-07-29 20:10:03.996296+05:30	\N
4	1	Emily Davis	9876543211	emily@email.com	1988-09-22	female	\N	\N	Customer	t	t	\N	2026-07-28 17:06:44.274473+05:30	1	2026-07-29 17:12:17.172457+05:30	\N
\.


--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 243
-- Name: appointment_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointment_services_id_seq', 148, true);


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 241
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appointments_id_seq', 115, true);


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 217
-- Name: business_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.business_types_id_seq', 6, true);


--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 249
-- Name: customer_package_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_package_services_id_seq', 5, true);


--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 239
-- Name: customer_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customer_packages_id_seq', 6, true);


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 231
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 9, true);


--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 225
-- Name: designations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.designations_id_seq', 12, true);


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 223
-- Name: otp_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.otp_verifications_id_seq', 35, true);


--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 237
-- Name: package_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.package_services_id_seq', 15, true);


--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 235
-- Name: packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.packages_id_seq', 3, true);


--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 247
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 18, true);


--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 245
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 15, true);


--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 233
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 19, true);


--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 227
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_id_seq', 4, true);


--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 229
-- Name: staff_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_services_id_seq', 85, true);


--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 219
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tenants_id_seq', 1, true);


--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- TOC entry 5002 (class 2606 OID 35838)
-- Name: appointment_services appointment_services_appointment_id_service_id_customer_pac_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_service_id_customer_pac_key UNIQUE (appointment_id, service_id, customer_package_id);


--
-- TOC entry 5004 (class 2606 OID 35836)
-- Name: appointment_services appointment_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 35785)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 35787)
-- Name: appointments appointments_staff_id_appointment_date_start_time_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_staff_id_appointment_date_start_time_key UNIQUE (staff_id, appointment_date, start_time);


--
-- TOC entry 4930 (class 2606 OID 35380)
-- Name: business_types business_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_pkey PRIMARY KEY (id);


--
-- TOC entry 5023 (class 2606 OID 36062)
-- Name: customer_package_services customer_package_services_customer_package_id_service_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_package_services
    ADD CONSTRAINT customer_package_services_customer_package_id_service_id_key UNIQUE (customer_package_id, service_id);


--
-- TOC entry 5025 (class 2606 OID 36060)
-- Name: customer_package_services customer_package_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_package_services
    ADD CONSTRAINT customer_package_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 35740)
-- Name: customer_packages customer_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_pkey PRIMARY KEY (id);


--
-- TOC entry 4959 (class 2606 OID 35598)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4944 (class 2606 OID 35453)
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 35455)
-- Name: designations designations_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4942 (class 2606 OID 35440)
-- Name: otp_verifications otp_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 35703)
-- Name: package_services package_services_package_id_service_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_package_id_service_id_key UNIQUE (package_id, service_id);


--
-- TOC entry 4981 (class 2606 OID 35701)
-- Name: package_services package_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 35673)
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 35675)
-- Name: packages packages_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 5019 (class 2606 OID 36038)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 36040)
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- TOC entry 5015 (class 2606 OID 35881)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 35637)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 4970 (class 2606 OID 35639)
-- Name: services services_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- TOC entry 4951 (class 2606 OID 35487)
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 35525)
-- Name: staff_services staff_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 35527)
-- Name: staff_services staff_services_staff_id_service_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_staff_id_service_id_key UNIQUE (staff_id, service_id);


--
-- TOC entry 4933 (class 2606 OID 35394)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 4938 (class 2606 OID 35412)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4940 (class 2606 OID 35414)
-- Name: users users_tenant_id_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_phone_key UNIQUE (tenant_id, phone);


--
-- TOC entry 5005 (class 1259 OID 35945)
-- Name: idx_appointment_services_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_services_appointment_id ON public.appointment_services USING btree (appointment_id);


--
-- TOC entry 5006 (class 1259 OID 35947)
-- Name: idx_appointment_services_customer_package_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_services_customer_package_id ON public.appointment_services USING btree (customer_package_id);


--
-- TOC entry 5007 (class 1259 OID 35946)
-- Name: idx_appointment_services_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointment_services_service_id ON public.appointment_services USING btree (service_id);


--
-- TOC entry 4992 (class 1259 OID 35941)
-- Name: idx_appointments_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_customer_id ON public.appointments USING btree (customer_id);


--
-- TOC entry 4993 (class 1259 OID 35942)
-- Name: idx_appointments_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_date ON public.appointments USING btree (appointment_date);


--
-- TOC entry 4994 (class 1259 OID 35944)
-- Name: idx_appointments_payment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_payment_status ON public.appointments USING btree (payment_status);


--
-- TOC entry 4995 (class 1259 OID 35940)
-- Name: idx_appointments_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_staff_id ON public.appointments USING btree (staff_id);


--
-- TOC entry 4996 (class 1259 OID 35943)
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- TOC entry 4997 (class 1259 OID 35938)
-- Name: idx_appointments_tenant_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_tenant_customer ON public.appointments USING btree (tenant_id, customer_id);


--
-- TOC entry 4998 (class 1259 OID 35936)
-- Name: idx_appointments_tenant_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_tenant_date ON public.appointments USING btree (tenant_id, appointment_date);


--
-- TOC entry 4999 (class 1259 OID 35937)
-- Name: idx_appointments_tenant_staff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_tenant_staff ON public.appointments USING btree (tenant_id, staff_id);


--
-- TOC entry 5000 (class 1259 OID 35939)
-- Name: idx_appointments_tenant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_tenant_status ON public.appointments USING btree (tenant_id, status);


--
-- TOC entry 4984 (class 1259 OID 35933)
-- Name: idx_customer_packages_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_packages_customer_id ON public.customer_packages USING btree (customer_id);


--
-- TOC entry 4985 (class 1259 OID 35935)
-- Name: idx_customer_packages_expiry_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_packages_expiry_date ON public.customer_packages USING btree (expiry_date);


--
-- TOC entry 4986 (class 1259 OID 35934)
-- Name: idx_customer_packages_package_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_packages_package_id ON public.customer_packages USING btree (package_id);


--
-- TOC entry 4987 (class 1259 OID 35932)
-- Name: idx_customer_packages_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_packages_tenant_id ON public.customer_packages USING btree (tenant_id);


--
-- TOC entry 4960 (class 1259 OID 35925)
-- Name: idx_customers_last_visit_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_last_visit_date ON public.customers USING btree (last_visit_date);


--
-- TOC entry 4961 (class 1259 OID 35924)
-- Name: idx_customers_preferred_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_preferred_staff_id ON public.customers USING btree (preferred_staff_id);


--
-- TOC entry 4962 (class 1259 OID 35922)
-- Name: idx_customers_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_tenant_id ON public.customers USING btree (tenant_id);


--
-- TOC entry 4963 (class 1259 OID 35923)
-- Name: idx_customers_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_user_id ON public.customers USING btree (user_id);


--
-- TOC entry 4976 (class 1259 OID 35930)
-- Name: idx_package_services_package_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_package_services_package_id ON public.package_services USING btree (package_id);


--
-- TOC entry 4977 (class 1259 OID 35931)
-- Name: idx_package_services_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_package_services_service_id ON public.package_services USING btree (service_id);


--
-- TOC entry 4971 (class 1259 OID 35929)
-- Name: idx_packages_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_packages_tenant_id ON public.packages USING btree (tenant_id);


--
-- TOC entry 5016 (class 1259 OID 36047)
-- Name: idx_refresh_tokens_hash; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_hash ON public.refresh_tokens USING btree (token_hash);


--
-- TOC entry 5017 (class 1259 OID 36046)
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 5008 (class 1259 OID 35951)
-- Name: idx_reviews_appointment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_appointment_id ON public.reviews USING btree (appointment_id);


--
-- TOC entry 5009 (class 1259 OID 35952)
-- Name: idx_reviews_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_created_at ON public.reviews USING btree (created_at);


--
-- TOC entry 5010 (class 1259 OID 35949)
-- Name: idx_reviews_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_customer_id ON public.reviews USING btree (customer_id);


--
-- TOC entry 5011 (class 1259 OID 35953)
-- Name: idx_reviews_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_rating ON public.reviews USING btree (rating);


--
-- TOC entry 5012 (class 1259 OID 35950)
-- Name: idx_reviews_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_staff_id ON public.reviews USING btree (staff_id);


--
-- TOC entry 5013 (class 1259 OID 35948)
-- Name: idx_reviews_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_tenant_id ON public.reviews USING btree (tenant_id);


--
-- TOC entry 4964 (class 1259 OID 35927)
-- Name: idx_services_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_category ON public.services USING btree (category);


--
-- TOC entry 4965 (class 1259 OID 35928)
-- Name: idx_services_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_is_active ON public.services USING btree (is_active);


--
-- TOC entry 4966 (class 1259 OID 35926)
-- Name: idx_services_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_services_tenant_id ON public.services USING btree (tenant_id);


--
-- TOC entry 4947 (class 1259 OID 35918)
-- Name: idx_staff_designation_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_designation_id ON public.staff USING btree (designation_id);


--
-- TOC entry 4952 (class 1259 OID 35920)
-- Name: idx_staff_services_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_services_service_id ON public.staff_services USING btree (service_id);


--
-- TOC entry 4953 (class 1259 OID 35919)
-- Name: idx_staff_services_staff_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_services_staff_id ON public.staff_services USING btree (staff_id);


--
-- TOC entry 4948 (class 1259 OID 35916)
-- Name: idx_staff_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_tenant_id ON public.staff USING btree (tenant_id);


--
-- TOC entry 4949 (class 1259 OID 35917)
-- Name: idx_staff_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_staff_user_id ON public.staff USING btree (user_id);


--
-- TOC entry 4931 (class 1259 OID 35912)
-- Name: idx_tenants_business_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tenants_business_type_id ON public.tenants USING btree (business_type_id);


--
-- TOC entry 4934 (class 1259 OID 35915)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4935 (class 1259 OID 35914)
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- TOC entry 4936 (class 1259 OID 35913)
-- Name: idx_users_tenant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_tenant_id ON public.users USING btree (tenant_id);


--
-- TOC entry 5092 (class 2620 OID 36028)
-- Name: appointments trigger_update_customer_stats; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_customer_stats AFTER INSERT OR DELETE OR UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_customer_stats();


--
-- TOC entry 5074 (class 2606 OID 35844)
-- Name: appointment_services appointment_services_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- TOC entry 5075 (class 2606 OID 35859)
-- Name: appointment_services appointment_services_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5076 (class 2606 OID 35854)
-- Name: appointment_services appointment_services_customer_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_customer_package_id_fkey FOREIGN KEY (customer_package_id) REFERENCES public.customer_packages(id) ON DELETE SET NULL;


--
-- TOC entry 5077 (class 2606 OID 35849)
-- Name: appointment_services appointment_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 5078 (class 2606 OID 35839)
-- Name: appointment_services appointment_services_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5079 (class 2606 OID 35864)
-- Name: appointment_services appointment_services_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5067 (class 2606 OID 35808)
-- Name: appointments appointments_cancelled_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_cancelled_by_user_id_fkey FOREIGN KEY (cancelled_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5068 (class 2606 OID 35813)
-- Name: appointments appointments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5069 (class 2606 OID 35793)
-- Name: appointments appointments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- TOC entry 5070 (class 2606 OID 35803)
-- Name: appointments appointments_customer_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_package_id_fkey FOREIGN KEY (customer_package_id) REFERENCES public.customer_packages(id) ON DELETE SET NULL;


--
-- TOC entry 5071 (class 2606 OID 35798)
-- Name: appointments appointments_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- TOC entry 5072 (class 2606 OID 35788)
-- Name: appointments appointments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5073 (class 2606 OID 35818)
-- Name: appointments appointments_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5026 (class 2606 OID 35954)
-- Name: business_types business_types_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5027 (class 2606 OID 35959)
-- Name: business_types business_types_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT business_types_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5087 (class 2606 OID 36078)
-- Name: customer_package_services customer_package_services_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_package_services
    ADD CONSTRAINT customer_package_services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5088 (class 2606 OID 36068)
-- Name: customer_package_services customer_package_services_customer_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_package_services
    ADD CONSTRAINT customer_package_services_customer_package_id_fkey FOREIGN KEY (customer_package_id) REFERENCES public.customer_packages(id) ON DELETE CASCADE;


--
-- TOC entry 5089 (class 2606 OID 36073)
-- Name: customer_package_services customer_package_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_package_services
    ADD CONSTRAINT customer_package_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 5090 (class 2606 OID 36063)
-- Name: customer_package_services customer_package_services_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_package_services
    ADD CONSTRAINT customer_package_services_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5091 (class 2606 OID 36083)
-- Name: customer_package_services customer_package_services_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_package_services
    ADD CONSTRAINT customer_package_services_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5062 (class 2606 OID 35756)
-- Name: customer_packages customer_packages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5063 (class 2606 OID 35746)
-- Name: customer_packages customer_packages_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 5064 (class 2606 OID 35751)
-- Name: customer_packages customer_packages_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id);


--
-- TOC entry 5065 (class 2606 OID 35741)
-- Name: customer_packages customer_packages_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 35761)
-- Name: customer_packages customer_packages_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_packages
    ADD CONSTRAINT customer_packages_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5047 (class 2606 OID 35614)
-- Name: customers customers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5048 (class 2606 OID 35609)
-- Name: customers customers_preferred_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_preferred_staff_id_fkey FOREIGN KEY (preferred_staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- TOC entry 5049 (class 2606 OID 35599)
-- Name: customers customers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5050 (class 2606 OID 35619)
-- Name: customers customers_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5051 (class 2606 OID 35604)
-- Name: customers customers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5034 (class 2606 OID 35461)
-- Name: designations designations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5035 (class 2606 OID 35456)
-- Name: designations designations_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5036 (class 2606 OID 35466)
-- Name: designations designations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5058 (class 2606 OID 35714)
-- Name: package_services package_services_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5059 (class 2606 OID 35704)
-- Name: package_services package_services_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE CASCADE;


--
-- TOC entry 5060 (class 2606 OID 35709)
-- Name: package_services package_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- TOC entry 5061 (class 2606 OID 35719)
-- Name: package_services package_services_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.package_services
    ADD CONSTRAINT package_services_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5055 (class 2606 OID 35681)
-- Name: packages packages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5056 (class 2606 OID 35676)
-- Name: packages packages_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5057 (class 2606 OID 35686)
-- Name: packages packages_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5086 (class 2606 OID 36041)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5080 (class 2606 OID 35897)
-- Name: reviews reviews_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- TOC entry 5081 (class 2606 OID 35902)
-- Name: reviews reviews_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5082 (class 2606 OID 35887)
-- Name: reviews reviews_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 5083 (class 2606 OID 35892)
-- Name: reviews reviews_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5084 (class 2606 OID 35882)
-- Name: reviews reviews_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5085 (class 2606 OID 35907)
-- Name: reviews reviews_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5052 (class 2606 OID 35645)
-- Name: services services_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5053 (class 2606 OID 35640)
-- Name: services services_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5054 (class 2606 OID 35650)
-- Name: services services_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5037 (class 2606 OID 35507)
-- Name: staff staff_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5038 (class 2606 OID 35502)
-- Name: staff staff_designation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_designation_id_fkey FOREIGN KEY (designation_id) REFERENCES public.designations(id);


--
-- TOC entry 5042 (class 2606 OID 35538)
-- Name: staff_services staff_services_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5043 (class 2606 OID 35655)
-- Name: staff_services staff_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- TOC entry 5044 (class 2606 OID 35533)
-- Name: staff_services staff_services_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;


--
-- TOC entry 5045 (class 2606 OID 35528)
-- Name: staff_services staff_services_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5046 (class 2606 OID 35543)
-- Name: staff_services staff_services_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_services
    ADD CONSTRAINT staff_services_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5039 (class 2606 OID 35492)
-- Name: staff staff_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5040 (class 2606 OID 35512)
-- Name: staff staff_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- TOC entry 5041 (class 2606 OID 35497)
-- Name: staff staff_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5028 (class 2606 OID 35395)
-- Name: tenants tenants_business_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_business_type_id_fkey FOREIGN KEY (business_type_id) REFERENCES public.business_types(id);


--
-- TOC entry 5029 (class 2606 OID 35964)
-- Name: tenants tenants_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5030 (class 2606 OID 35969)
-- Name: tenants tenants_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5031 (class 2606 OID 35422)
-- Name: users users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 5032 (class 2606 OID 35417)
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- TOC entry 5033 (class 2606 OID 35427)
-- Name: users users_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


-- Completed on 2026-07-30 17:45:38

--
-- PostgreSQL database dump complete
--

