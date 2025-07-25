PGDMP  :                    }         
   db_ceragen    15.13    16.0 �   \           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            ]           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            ^           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            _           1262    26483 
   db_ceragen    DATABASE     v   CREATE DATABASE db_ceragen WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
    DROP DATABASE db_ceragen;
                uceragen    false                        2615    26485    ceragen    SCHEMA        CREATE SCHEMA ceragen;
    DROP SCHEMA ceragen;
                uceragen    false            8           1255    26486    register_insert_event()    FUNCTION     7  CREATE FUNCTION ceragen.register_insert_event() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
    table_id INTEGER;
    user_id INTEGER;
BEGIN
    -- Obtener el ID de la tabla
    SELECT aut_id INTO table_id
    FROM ceragen.audi_tables
    WHERE aut_table_name = TG_TABLE_NAME;

    -- Verificar que la tabla exista en audi_tables
    IF table_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró la tabla en ceragen.audi_tables: %', TG_TABLE_NAME;
    END IF;

    -- Obtener el ID del usuario basado en user_created
    SELECT su.user_id INTO user_id
    FROM ceragen.segu_user su
    WHERE su.user_login_id = NEW.user_created 
    AND su.user_state = true 
    AND su.user_locked = false;
    

    -- Verificar si el usuario tiene permisos
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'El usuario no tiene permisos suficientes para realizar esta operación.';
    END IF;

    -- Insertar el registro del evento de inserción en la tabla de auditoría
    INSERT INTO ceragen.audi_sql_events_register (
        ser_table_id,
        ser_sql_command_type,
        ser_new_record_detail,
        ser_user_process_id,
        ser_date_event
    ) VALUES (
        table_id,
        'INSERT',
        jsonb_strip_nulls(ROW_TO_JSON(NEW)::jsonb)::TEXT,
        user_id,
        NOW()
    );

    RETURN NEW;
END;
$$;
 /   DROP FUNCTION ceragen.register_insert_event();
       ceragen          secoed    false    6            9           1255    26487    register_login_event()    FUNCTION     �  CREATE FUNCTION ceragen.register_login_event() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
    table_id INTEGER;
    sql_command_type TEXT;
BEGIN
    -- Obtener el ID de la tabla
    SELECT aut_id INTO table_id
    FROM ceragen.audi_tables
    WHERE aut_table_name = TG_TABLE_NAME;

    -- Verificar que la tabla existe en audi_tables
    IF table_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró la tabla en ceragen.audi_tables: %', TG_TABLE_NAME;
    END IF;

    -- Determinar el tipo de operación (INSERT o UPDATE)
    sql_command_type := TG_OP;

    -- Insertar el registro en la tabla de auditoría
    INSERT INTO ceragen.audi_sql_events_register (
        ser_table_id,
        ser_sql_command_type,
        ser_new_record_detail,
        ser_old_record_detail,
        ser_user_process_id,
        ser_date_event
    ) VALUES (
        table_id,
        sql_command_type,
        jsonb_strip_nulls(ROW_TO_JSON(NEW)::jsonb)::TEXT,
        CASE WHEN sql_command_type = 'UPDATE' THEN jsonb_strip_nulls(ROW_TO_JSON(OLD)::jsonb)::TEXT ELSE NULL END,
        NEW.slo_user_id,  -- Usar el ID del usuario directamente
        NOW()
    );

    RETURN NEW;
END;$$;
 .   DROP FUNCTION ceragen.register_login_event();
       ceragen          secoed    false    6            :           1255    26488    register_update_event()    FUNCTION     x  CREATE FUNCTION ceragen.register_update_event() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
    table_id INTEGER;
    user_id INTEGER;
    sql_command_type TEXT;
BEGIN
    -- Obtener el ID de la tabla
    SELECT aut_id INTO table_id
    FROM ceragen.audi_tables
    WHERE aut_table_name = TG_TABLE_NAME;

    -- Validar que la tabla existe en audi_tables
    IF table_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró la tabla en ceragen.audi_tables: %', TG_TABLE_NAME;
    END IF;

    -- Determinar si es una eliminación lógica o una actualización
    IF OLD.date_deleted IS DISTINCT FROM NEW.date_deleted AND NEW.date_deleted IS NOT NULL THEN
        sql_command_type := 'DELETE';
    ELSIF OLD.date_modified IS DISTINCT FROM NEW.date_modified THEN
        sql_command_type := 'UPDATE';
    ELSE
        RETURN NEW; -- No hay cambios relevantes
    END IF;

    -- Obtener el usuario responsable de la acción
    SELECT su.user_id INTO user_id
    FROM ceragen.segu_user su
    WHERE su.user_login_id = 
        CASE 
            WHEN sql_command_type = 'DELETE' THEN NEW.user_deleted 
            ELSE NEW.user_modified 
        END
    AND su.user_state = TRUE 
    AND su.user_locked = FALSE;
    

    -- Verificar permisos del usuario
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'El usuario no tiene permisos suficientes para realizar esta operación.';
    END IF;

    -- Registrar el evento en la tabla de auditoría
    INSERT INTO ceragen.audi_sql_events_register (
        ser_table_id,
        ser_sql_command_type,
        ser_new_record_detail,
        ser_old_record_detail,
        ser_user_process_id,
        ser_date_event
    ) VALUES (
        table_id,
        sql_command_type,
        jsonb_strip_nulls(ROW_TO_JSON(NEW)::jsonb)::TEXT,
        jsonb_strip_nulls(ROW_TO_JSON(OLD)::jsonb)::TEXT,
        user_id,
        NOW()
    );

    RETURN NEW;
END;$$;
 /   DROP FUNCTION ceragen.register_update_event();
       ceragen          secoed    false    6                       1259    27357    admin_client    TABLE     i  CREATE TABLE ceragen.admin_client (
    cli_id integer NOT NULL,
    cli_person_id integer NOT NULL,
    cli_identification character varying(13) NOT NULL,
    cli_name character varying(100) NOT NULL,
    cli_address_bill character varying(200),
    cli_mail_bill character varying(100),
    cli_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 !   DROP TABLE ceragen.admin_client;
       ceragen         heap    uceragen    false    6                       1259    27356    admin_client_cli_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_client_cli_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE ceragen.admin_client_cli_id_seq;
       ceragen          uceragen    false    260    6            `           0    0    admin_client_cli_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE ceragen.admin_client_cli_id_seq OWNED BY ceragen.admin_client.cli_id;
          ceragen          uceragen    false    259            �            1259    27281    admin_expense    TABLE     �  CREATE TABLE ceragen.admin_expense (
    exp_id integer NOT NULL,
    exp_type_id integer NOT NULL,
    exp_payment_method_id integer NOT NULL,
    exp_date timestamp without time zone NOT NULL,
    exp_amount numeric(12,2) NOT NULL,
    exp_description character varying(200),
    exp_receipt_number character varying(100),
    exp_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 "   DROP TABLE ceragen.admin_expense;
       ceragen         heap    uceragen    false    6            �            1259    27280    admin_expense_exp_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_expense_exp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE ceragen.admin_expense_exp_id_seq;
       ceragen          uceragen    false    6    252            a           0    0    admin_expense_exp_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE ceragen.admin_expense_exp_id_seq OWNED BY ceragen.admin_expense.exp_id;
          ceragen          uceragen    false    251            �            1259    27273    admin_expense_type    TABLE     �  CREATE TABLE ceragen.admin_expense_type (
    ext_id integer NOT NULL,
    ext_name character varying(40) NOT NULL,
    ext_description character varying(100) NOT NULL,
    ext_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 '   DROP TABLE ceragen.admin_expense_type;
       ceragen         heap    uceragen    false    6            �            1259    27272    admin_expense_type_ext_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_expense_type_ext_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE ceragen.admin_expense_type_ext_id_seq;
       ceragen          uceragen    false    6    250            b           0    0    admin_expense_type_ext_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE ceragen.admin_expense_type_ext_id_seq OWNED BY ceragen.admin_expense_type.ext_id;
          ceragen          uceragen    false    249            "           1259    27699    admin_invoice    TABLE     (  CREATE TABLE ceragen.admin_invoice (
    inv_id integer NOT NULL,
    inv_number character varying(20) NOT NULL,
    inv_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    inv_client_id integer NOT NULL,
    inv_patient_id integer,
    inv_subtotal numeric(10,2) NOT NULL,
    inv_discount numeric(10,2) DEFAULT 0,
    inv_tax numeric(10,2) DEFAULT 0,
    inv_grand_total numeric(10,2) GENERATED ALWAYS AS (((inv_subtotal - inv_discount) + inv_tax)) STORED,
    inv_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 "   DROP TABLE ceragen.admin_invoice;
       ceragen         heap    postgres    false    6            $           1259    27724    admin_invoice_detail    TABLE     O  CREATE TABLE ceragen.admin_invoice_detail (
    ind_id integer NOT NULL,
    ind_invoice_id integer NOT NULL,
    ind_product_id integer NOT NULL,
    ind_quantity integer NOT NULL,
    ind_unit_price numeric(10,2) NOT NULL,
    ind_total numeric(10,2) NOT NULL,
    ind_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 )   DROP TABLE ceragen.admin_invoice_detail;
       ceragen         heap    postgres    false    6            #           1259    27723    admin_invoice_detail_ind_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_invoice_detail_ind_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE ceragen.admin_invoice_detail_ind_id_seq;
       ceragen          postgres    false    292    6            c           0    0    admin_invoice_detail_ind_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE ceragen.admin_invoice_detail_ind_id_seq OWNED BY ceragen.admin_invoice_detail.ind_id;
          ceragen          postgres    false    291            !           1259    27698    admin_invoice_inv_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_invoice_inv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE ceragen.admin_invoice_inv_id_seq;
       ceragen          postgres    false    6    290            d           0    0    admin_invoice_inv_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE ceragen.admin_invoice_inv_id_seq OWNED BY ceragen.admin_invoice.inv_id;
          ceragen          postgres    false    289            &           1259    27742    admin_invoice_payment    TABLE     S  CREATE TABLE ceragen.admin_invoice_payment (
    inp_id integer NOT NULL,
    inp_invoice_id integer NOT NULL,
    inp_payment_method_id integer NOT NULL,
    inp_amount numeric(10,2) NOT NULL,
    inp_reference character varying(100),
    inp_proof_image_path text,
    inp_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 *   DROP TABLE ceragen.admin_invoice_payment;
       ceragen         heap    postgres    false    6            %           1259    27741     admin_invoice_payment_inp_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_invoice_payment_inp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE ceragen.admin_invoice_payment_inp_id_seq;
       ceragen          postgres    false    6    294            e           0    0     admin_invoice_payment_inp_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE ceragen.admin_invoice_payment_inp_id_seq OWNED BY ceragen.admin_invoice_payment.inp_id;
          ceragen          postgres    false    293            *           1259    27772    admin_invoice_tax    TABLE     �  CREATE TABLE ceragen.admin_invoice_tax (
    int_id integer NOT NULL,
    int_invoice_id integer NOT NULL,
    int_tax_id integer NOT NULL,
    int_tax_amount numeric(10,2) NOT NULL,
    int_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 &   DROP TABLE ceragen.admin_invoice_tax;
       ceragen         heap    postgres    false    6            )           1259    27771    admin_invoice_tax_int_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_invoice_tax_int_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 4   DROP SEQUENCE ceragen.admin_invoice_tax_int_id_seq;
       ceragen          postgres    false    6    298            f           0    0    admin_invoice_tax_int_id_seq    SEQUENCE OWNED BY     _   ALTER SEQUENCE ceragen.admin_invoice_tax_int_id_seq OWNED BY ceragen.admin_invoice_tax.int_id;
          ceragen          postgres    false    297            �            1259    26513    admin_marital_status    TABLE     �  CREATE TABLE ceragen.admin_marital_status (
    id integer NOT NULL,
    status_name character varying(100) NOT NULL,
    state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 )   DROP TABLE ceragen.admin_marital_status;
       ceragen         heap    secoed    false    6            �            1259    26517    admin_marital_status_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_marital_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE ceragen.admin_marital_status_id_seq;
       ceragen          secoed    false    215    6            g           0    0    admin_marital_status_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE ceragen.admin_marital_status_id_seq OWNED BY ceragen.admin_marital_status.id;
          ceragen          secoed    false    216            �            1259    27237    admin_medic_person_type    TABLE     �  CREATE TABLE ceragen.admin_medic_person_type (
    mpt_id integer NOT NULL,
    mpt_name character varying(30) NOT NULL,
    mpt_description character varying(80),
    mpt_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 ,   DROP TABLE ceragen.admin_medic_person_type;
       ceragen         heap    uceragen    false    6            �            1259    27236 "   admin_medic_person_type_mpt_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_medic_person_type_mpt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 :   DROP SEQUENCE ceragen.admin_medic_person_type_mpt_id_seq;
       ceragen          uceragen    false    6    244            h           0    0 "   admin_medic_person_type_mpt_id_seq    SEQUENCE OWNED BY     k   ALTER SEQUENCE ceragen.admin_medic_person_type_mpt_id_seq OWNED BY ceragen.admin_medic_person_type.mpt_id;
          ceragen          uceragen    false    243            �            1259    27245    admin_medical_staff    TABLE     3  CREATE TABLE ceragen.admin_medical_staff (
    med_id integer NOT NULL,
    med_person_id integer NOT NULL,
    med_type_id integer NOT NULL,
    med_registration_number character varying(50),
    med_specialty character varying(100),
    med_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 (   DROP TABLE ceragen.admin_medical_staff;
       ceragen         heap    uceragen    false    6            �            1259    27244    admin_medical_staff_med_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_medical_staff_med_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE ceragen.admin_medical_staff_med_id_seq;
       ceragen          uceragen    false    6    246            i           0    0    admin_medical_staff_med_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE ceragen.admin_medical_staff_med_id_seq OWNED BY ceragen.admin_medical_staff.med_id;
          ceragen          uceragen    false    245            �            1259    26518    admin_parameter_list    TABLE     g  CREATE TABLE ceragen.admin_parameter_list (
    pli_id integer NOT NULL,
    pli_code_parameter character varying(100) NOT NULL,
    pli_is_numeric_return_value boolean DEFAULT true NOT NULL,
    pli_string_value_return character varying(100),
    pli_numeric_value_return numeric(8,2),
    pli_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 )   DROP TABLE ceragen.admin_parameter_list;
       ceragen         heap    uceragen    false    6            �            1259    26525    admin_parameter_list_pli_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_parameter_list_pli_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE ceragen.admin_parameter_list_pli_id_seq;
       ceragen          uceragen    false    6    217            j           0    0    admin_parameter_list_pli_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE ceragen.admin_parameter_list_pli_id_seq OWNED BY ceragen.admin_parameter_list.pli_id;
          ceragen          uceragen    false    218                       1259    27514    admin_patient    TABLE     �  CREATE TABLE ceragen.admin_patient (
    pat_id integer NOT NULL,
    pat_person_id integer NOT NULL,
    pat_client_id integer NOT NULL,
    pat_code character varying(20),
    pat_medical_conditions text,
    pat_allergies text,
    pat_blood_type character varying(3),
    pat_emergency_contact_name character varying(100),
    pat_emergency_contact_phone character varying(20),
    pat_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 "   DROP TABLE ceragen.admin_patient;
       ceragen         heap    uceragen    false    6                       1259    27513    admin_patient_pat_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_patient_pat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE ceragen.admin_patient_pat_id_seq;
       ceragen          uceragen    false    6    276            k           0    0    admin_patient_pat_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE ceragen.admin_patient_pat_id_seq OWNED BY ceragen.admin_patient.pat_id;
          ceragen          uceragen    false    275            �            1259    27263    admin_payment_method    TABLE     l  CREATE TABLE ceragen.admin_payment_method (
    pme_id integer NOT NULL,
    pme_name character varying(40) NOT NULL,
    pme_description character varying(100) NOT NULL,
    pme_require_references boolean DEFAULT false NOT NULL,
    pme_require_picture_proff boolean DEFAULT false NOT NULL,
    pme_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 )   DROP TABLE ceragen.admin_payment_method;
       ceragen         heap    uceragen    false    6            �            1259    27262    admin_payment_method_pme_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_payment_method_pme_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE ceragen.admin_payment_method_pme_id_seq;
       ceragen          uceragen    false    6    248            l           0    0    admin_payment_method_pme_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE ceragen.admin_payment_method_pme_id_seq OWNED BY ceragen.admin_payment_method.pme_id;
          ceragen          uceragen    false    247            �            1259    26534    admin_person    TABLE     `  CREATE TABLE ceragen.admin_person (
    per_id integer NOT NULL,
    per_identification character varying(20) NOT NULL,
    per_names character varying(100) NOT NULL,
    per_surnames character varying(100) NOT NULL,
    per_genre_id integer NOT NULL,
    per_marital_status_id integer NOT NULL,
    per_country character varying(100),
    per_city character varying(100),
    per_address character varying(200),
    per_phone character varying(100),
    per_mail character varying(100),
    per_birth_date timestamp without time zone,
    per_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 !   DROP TABLE ceragen.admin_person;
       ceragen         heap    uceragen    false    6            �            1259    26540    admin_person_genre    TABLE     �  CREATE TABLE ceragen.admin_person_genre (
    id integer NOT NULL,
    genre_name character varying(100) NOT NULL,
    state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 '   DROP TABLE ceragen.admin_person_genre;
       ceragen         heap    uceragen    false    6            �            1259    26544    admin_person_genre_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_person_genre_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE ceragen.admin_person_genre_id_seq;
       ceragen          uceragen    false    220    6            m           0    0    admin_person_genre_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE ceragen.admin_person_genre_id_seq OWNED BY ceragen.admin_person_genre.id;
          ceragen          uceragen    false    221            �            1259    26545    admin_person_per_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_person_per_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE ceragen.admin_person_per_id_seq;
       ceragen          uceragen    false    6    219            n           0    0    admin_person_per_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE ceragen.admin_person_per_id_seq OWNED BY ceragen.admin_person.per_id;
          ceragen          uceragen    false    222                        1259    27323    admin_product    TABLE     �  CREATE TABLE ceragen.admin_product (
    pro_id integer NOT NULL,
    pro_code character varying(20) NOT NULL,
    pro_name character varying(100) NOT NULL,
    pro_description text,
    pro_price numeric(10,2) NOT NULL,
    pro_total_sessions integer NOT NULL,
    pro_duration_days integer,
    pro_image_url character varying(200),
    pro_therapy_type_id integer NOT NULL,
    pro_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 "   DROP TABLE ceragen.admin_product;
       ceragen         heap    uceragen    false    6            �            1259    27322    admin_product_pro_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_product_pro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE ceragen.admin_product_pro_id_seq;
       ceragen          uceragen    false    6    256            o           0    0    admin_product_pro_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE ceragen.admin_product_pro_id_seq OWNED BY ceragen.admin_product.pro_id;
          ceragen          uceragen    false    255                       1259    27340    admin_product_promotion    TABLE     �  CREATE TABLE ceragen.admin_product_promotion (
    ppr_id integer NOT NULL,
    ppr_product_id integer NOT NULL,
    ppr_name character varying(100) NOT NULL,
    ppr_description text,
    ppr_discount_percent numeric(5,2) DEFAULT 0,
    ppr_extra_sessions integer DEFAULT 0,
    ppr_start_date date NOT NULL,
    ppr_end_date date NOT NULL,
    ppr_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 ,   DROP TABLE ceragen.admin_product_promotion;
       ceragen         heap    uceragen    false    6                       1259    27339 "   admin_product_promotion_ppr_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_product_promotion_ppr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 :   DROP SEQUENCE ceragen.admin_product_promotion_ppr_id_seq;
       ceragen          uceragen    false    6    258            p           0    0 "   admin_product_promotion_ppr_id_seq    SEQUENCE OWNED BY     k   ALTER SEQUENCE ceragen.admin_product_promotion_ppr_id_seq OWNED BY ceragen.admin_product_promotion.ppr_id;
          ceragen          uceragen    false    257            (           1259    27762 	   admin_tax    TABLE     �  CREATE TABLE ceragen.admin_tax (
    tax_id integer NOT NULL,
    tax_name character varying(50) NOT NULL,
    tax_percentage numeric(5,2) NOT NULL,
    tax_description text,
    tax_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
    DROP TABLE ceragen.admin_tax;
       ceragen         heap    postgres    false    6            '           1259    27761    admin_tax_tax_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_tax_tax_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE ceragen.admin_tax_tax_id_seq;
       ceragen          postgres    false    296    6            q           0    0    admin_tax_tax_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE ceragen.admin_tax_tax_id_seq OWNED BY ceragen.admin_tax.tax_id;
          ceragen          postgres    false    295            �            1259    27313    admin_therapy_type    TABLE     �  CREATE TABLE ceragen.admin_therapy_type (
    tht_id integer NOT NULL,
    tht_name character varying(50) NOT NULL,
    tht_description text,
    tht_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 '   DROP TABLE ceragen.admin_therapy_type;
       ceragen         heap    uceragen    false    6            �            1259    27312    admin_therapy_type_tht_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.admin_therapy_type_tht_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE ceragen.admin_therapy_type_tht_id_seq;
       ceragen          uceragen    false    254    6            r           0    0    admin_therapy_type_tht_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE ceragen.admin_therapy_type_tht_id_seq OWNED BY ceragen.admin_therapy_type.tht_id;
          ceragen          uceragen    false    253            �            1259    26553    audi_sql_events_register    TABLE     Y  CREATE TABLE ceragen.audi_sql_events_register (
    ser_id integer NOT NULL,
    ser_table_id integer,
    ser_sql_command_type character varying(20),
    ser_new_record_detail character varying(1000),
    ser_old_record_detail character varying(1000),
    ser_user_process_id integer,
    ser_date_event timestamp without time zone NOT NULL
);
 -   DROP TABLE ceragen.audi_sql_events_register;
       ceragen         heap    uceragen    false    6            �            1259    26558 #   audi_sql_events_register_ser_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.audi_sql_events_register_ser_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ;   DROP SEQUENCE ceragen.audi_sql_events_register_ser_id_seq;
       ceragen          uceragen    false    6    223            s           0    0 #   audi_sql_events_register_ser_id_seq    SEQUENCE OWNED BY     m   ALTER SEQUENCE ceragen.audi_sql_events_register_ser_id_seq OWNED BY ceragen.audi_sql_events_register.ser_id;
          ceragen          uceragen    false    224            �            1259    26559    audi_tables    TABLE     �  CREATE TABLE ceragen.audi_tables (
    aut_id integer NOT NULL,
    aut_table_name character varying(100) NOT NULL,
    aut_table_descriptiom character varying(300),
    aut_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
     DROP TABLE ceragen.audi_tables;
       ceragen         heap    uceragen    false    6            �            1259    26565    audi_tables_aut_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.audi_tables_aut_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE ceragen.audi_tables_aut_id_seq;
       ceragen          uceragen    false    6    225            t           0    0    audi_tables_aut_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE ceragen.audi_tables_aut_id_seq OWNED BY ceragen.audi_tables.aut_id;
          ceragen          uceragen    false    226                       1259    27626    clinic_allergy_catalog    TABLE     �  CREATE TABLE ceragen.clinic_allergy_catalog (
    al_id integer NOT NULL,
    al_name character varying(100) NOT NULL,
    al_description text,
    al_state boolean DEFAULT true,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 +   DROP TABLE ceragen.clinic_allergy_catalog;
       ceragen         heap    uceragen    false    6                       1259    27625     clinic_allergy_catalog_al_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.clinic_allergy_catalog_al_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE ceragen.clinic_allergy_catalog_al_id_seq;
       ceragen          uceragen    false    6    286            u           0    0     clinic_allergy_catalog_al_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE ceragen.clinic_allergy_catalog_al_id_seq OWNED BY ceragen.clinic_allergy_catalog.al_id;
          ceragen          uceragen    false    285                       1259    27591    clinic_disease_catalog    TABLE     �  CREATE TABLE ceragen.clinic_disease_catalog (
    dis_id integer NOT NULL,
    dis_name character varying(100) NOT NULL,
    dis_description text,
    dis_type_id integer NOT NULL,
    dis_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 +   DROP TABLE ceragen.clinic_disease_catalog;
       ceragen         heap    uceragen    false    6                       1259    27590 !   clinic_disease_catalog_dis_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.clinic_disease_catalog_dis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 9   DROP SEQUENCE ceragen.clinic_disease_catalog_dis_id_seq;
       ceragen          uceragen    false    6    282            v           0    0 !   clinic_disease_catalog_dis_id_seq    SEQUENCE OWNED BY     i   ALTER SEQUENCE ceragen.clinic_disease_catalog_dis_id_seq OWNED BY ceragen.clinic_disease_catalog.dis_id;
          ceragen          uceragen    false    281                       1259    27581    clinic_disease_type    TABLE     �  CREATE TABLE ceragen.clinic_disease_type (
    dst_id integer NOT NULL,
    dst_name character varying(100) NOT NULL,
    dst_description text,
    dst_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 (   DROP TABLE ceragen.clinic_disease_type;
       ceragen         heap    uceragen    false    6                       1259    27580    clinic_disease_type_dst_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.clinic_disease_type_dst_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 6   DROP SEQUENCE ceragen.clinic_disease_type_dst_id_seq;
       ceragen          uceragen    false    6    280            w           0    0    clinic_disease_type_dst_id_seq    SEQUENCE OWNED BY     c   ALTER SEQUENCE ceragen.clinic_disease_type_dst_id_seq OWNED BY ceragen.clinic_disease_type.dst_id;
          ceragen          uceragen    false    279                        1259    27636    clinic_patient_allergy    TABLE     �  CREATE TABLE ceragen.clinic_patient_allergy (
    pa_id integer NOT NULL,
    pa_patient_id integer NOT NULL,
    pa_allergy_id integer NOT NULL,
    pa_reaction_description text,
    user_created character varying(100),
    date_created timestamp without time zone,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 +   DROP TABLE ceragen.clinic_patient_allergy;
       ceragen         heap    uceragen    false    6                       1259    27635     clinic_patient_allergy_pa_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.clinic_patient_allergy_pa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE ceragen.clinic_patient_allergy_pa_id_seq;
       ceragen          uceragen    false    288    6            x           0    0     clinic_patient_allergy_pa_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE ceragen.clinic_patient_allergy_pa_id_seq OWNED BY ceragen.clinic_patient_allergy.pa_id;
          ceragen          uceragen    false    287                       1259    27606    clinic_patient_disease    TABLE     �  CREATE TABLE ceragen.clinic_patient_disease (
    pd_id integer NOT NULL,
    pd_patient_id integer NOT NULL,
    pd_disease_id integer NOT NULL,
    pd_is_current boolean DEFAULT true,
    pd_notes text,
    user_created character varying(100),
    date_created timestamp without time zone,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 +   DROP TABLE ceragen.clinic_patient_disease;
       ceragen         heap    uceragen    false    6                       1259    27605     clinic_patient_disease_pd_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.clinic_patient_disease_pd_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE ceragen.clinic_patient_disease_pd_id_seq;
       ceragen          uceragen    false    6    284            y           0    0     clinic_patient_disease_pd_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE ceragen.clinic_patient_disease_pd_id_seq OWNED BY ceragen.clinic_patient_disease.pd_id;
          ceragen          uceragen    false    283                       1259    27537    clinic_patient_medical_history    TABLE     '  CREATE TABLE ceragen.clinic_patient_medical_history (
    hist_id integer NOT NULL,
    hist_patient_id integer NOT NULL,
    hist_primary_complaint text,
    hist_onset_date date,
    hist_related_trauma boolean,
    hist_current_treatment text,
    hist_notes text,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 3   DROP TABLE ceragen.clinic_patient_medical_history;
       ceragen         heap    uceragen    false    6                       1259    27536 *   clinic_patient_medical_history_hist_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.clinic_patient_medical_history_hist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 B   DROP SEQUENCE ceragen.clinic_patient_medical_history_hist_id_seq;
       ceragen          uceragen    false    278    6            z           0    0 *   clinic_patient_medical_history_hist_id_seq    SEQUENCE OWNED BY     {   ALTER SEQUENCE ceragen.clinic_patient_medical_history_hist_id_seq OWNED BY ceragen.clinic_patient_medical_history.hist_id;
          ceragen          uceragen    false    277            ,           1259    27899    clinic_session_control    TABLE     �  CREATE TABLE ceragen.clinic_session_control (
    sec_id integer NOT NULL,
    sec_inv_id integer NOT NULL,
    sec_pro_id integer NOT NULL,
    sec_ses_number integer NOT NULL,
    sec_ses_agend_date timestamp without time zone,
    sec_ses_exec_date timestamp without time zone,
    sec_typ_id integer NOT NULL,
    sec_med_staff_id integer NOT NULL,
    ses_consumed boolean DEFAULT false NOT NULL,
    ses_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 +   DROP TABLE ceragen.clinic_session_control;
       ceragen         heap    postgres    false    6            +           1259    27898 !   clinic_session_control_sec_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.clinic_session_control_sec_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 9   DROP SEQUENCE ceragen.clinic_session_control_sec_id_seq;
       ceragen          postgres    false    6    300            {           0    0 !   clinic_session_control_sec_id_seq    SEQUENCE OWNED BY     i   ALTER SEQUENCE ceragen.clinic_session_control_sec_id_seq OWNED BY ceragen.clinic_session_control.sec_id;
          ceragen          postgres    false    299            �            1259    26702 
   segu_login    TABLE     m  CREATE TABLE ceragen.segu_login (
    slo_id integer NOT NULL,
    slo_user_id integer NOT NULL,
    slo_token character varying(1000) NOT NULL,
    slo_origin_ip character varying(100) NOT NULL,
    slo_host_name character varying(100),
    slo_date_start_connection timestamp without time zone NOT NULL,
    slo_date_end_connection timestamp without time zone
);
    DROP TABLE ceragen.segu_login;
       ceragen         heap    uceragen    false    6            �            1259    26707    segu_login_slo_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.segu_login_slo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE ceragen.segu_login_slo_id_seq;
       ceragen          uceragen    false    6    227            |           0    0    segu_login_slo_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE ceragen.segu_login_slo_id_seq OWNED BY ceragen.segu_login.slo_id;
          ceragen          uceragen    false    228            �            1259    26708 	   segu_menu    TABLE     �  CREATE TABLE ceragen.segu_menu (
    menu_id integer NOT NULL,
    menu_name character varying(100) NOT NULL,
    menu_order integer NOT NULL,
    menu_module_id integer NOT NULL,
    menu_parent_id integer,
    menu_icon_name character varying(100),
    menu_href character varying(100),
    menu_url character varying(100),
    menu_key character varying(100),
    menu_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
    DROP TABLE ceragen.segu_menu;
       ceragen         heap    uceragen    false    6            �            1259    26714    segu_menu_menu_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.segu_menu_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE ceragen.segu_menu_menu_id_seq;
       ceragen          uceragen    false    229    6            }           0    0    segu_menu_menu_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE ceragen.segu_menu_menu_id_seq OWNED BY ceragen.segu_menu.menu_id;
          ceragen          uceragen    false    230            �            1259    26715    segu_menu_rol    TABLE     �  CREATE TABLE ceragen.segu_menu_rol (
    mr_id integer NOT NULL,
    mr_menu_id integer NOT NULL,
    mr_rol_id integer NOT NULL,
    mr_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 "   DROP TABLE ceragen.segu_menu_rol;
       ceragen         heap    uceragen    false    6            �            1259    26719    segu_menu_rol_mr_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.segu_menu_rol_mr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE ceragen.segu_menu_rol_mr_id_seq;
       ceragen          uceragen    false    231    6            ~           0    0    segu_menu_rol_mr_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE ceragen.segu_menu_rol_mr_id_seq OWNED BY ceragen.segu_menu_rol.mr_id;
          ceragen          uceragen    false    232            �            1259    26720    segu_module    TABLE     V  CREATE TABLE ceragen.segu_module (
    mod_id integer NOT NULL,
    mod_name character varying(100) NOT NULL,
    mod_description character varying(200),
    mod_order integer NOT NULL,
    mod_icon_name character varying(100),
    mod_text_name character varying(100),
    mod_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
     DROP TABLE ceragen.segu_module;
       ceragen         heap    uceragen    false    6            �            1259    26726    segu_module_mod_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.segu_module_mod_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE ceragen.segu_module_mod_id_seq;
       ceragen          uceragen    false    6    233                       0    0    segu_module_mod_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE ceragen.segu_module_mod_id_seq OWNED BY ceragen.segu_module.mod_id;
          ceragen          uceragen    false    234            �            1259    26727    segu_rol    TABLE       CREATE TABLE ceragen.segu_rol (
    rol_id integer NOT NULL,
    rol_name character varying(100) NOT NULL,
    rol_description character varying(200),
    rol_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone,
    is_admin_rol boolean DEFAULT false
);
    DROP TABLE ceragen.segu_rol;
       ceragen         heap    uceragen    false    6            �            1259    26734    segu_rol_rol_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.segu_rol_rol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE ceragen.segu_rol_rol_id_seq;
       ceragen          uceragen    false    235    6            �           0    0    segu_rol_rol_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE ceragen.segu_rol_rol_id_seq OWNED BY ceragen.segu_rol.rol_id;
          ceragen          uceragen    false    236            �            1259    26735 	   segu_user    TABLE     �  CREATE TABLE ceragen.segu_user (
    user_id integer NOT NULL,
    user_person_id integer NOT NULL,
    user_login_id character varying(100) NOT NULL,
    user_mail character varying(100) NOT NULL,
    user_password character varying(200) NOT NULL,
    user_locked boolean DEFAULT false NOT NULL,
    user_state boolean DEFAULT true NOT NULL,
    user_last_login timestamp without time zone,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone,
    login_attempts integer DEFAULT 0,
    twofa_enabled boolean DEFAULT false
);
    DROP TABLE ceragen.segu_user;
       ceragen         heap    uceragen    false    6            �            1259    26743    segu_user_notification    TABLE     '  CREATE TABLE ceragen.segu_user_notification (
    sun_id integer NOT NULL,
    sun_user_source_id integer NOT NULL,
    sun_user_destination_id integer NOT NULL,
    sun_title_notification character varying(200) NOT NULL,
    sun_text_notification character varying(1000) NOT NULL,
    sun_date_notification timestamp without time zone NOT NULL,
    sun_state_notification boolean DEFAULT true NOT NULL,
    sun_isread_notification boolean DEFAULT false NOT NULL,
    sun_date_read_notification timestamp without time zone,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 +   DROP TABLE ceragen.segu_user_notification;
       ceragen         heap    uceragen    false    6            �            1259    26750 !   segu_user_notification_sun_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.segu_user_notification_sun_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 9   DROP SEQUENCE ceragen.segu_user_notification_sun_id_seq;
       ceragen          uceragen    false    6    238            �           0    0 !   segu_user_notification_sun_id_seq    SEQUENCE OWNED BY     i   ALTER SEQUENCE ceragen.segu_user_notification_sun_id_seq OWNED BY ceragen.segu_user_notification.sun_id;
          ceragen          uceragen    false    239            �            1259    26751    segu_user_rol    TABLE     �  CREATE TABLE ceragen.segu_user_rol (
    id_user_rol integer NOT NULL,
    id_user integer NOT NULL,
    id_rol integer NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone,
    state boolean
);
 "   DROP TABLE ceragen.segu_user_rol;
       ceragen         heap    uceragen    false    6            �            1259    26759    segu_user_rol_id_user_rol_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.segu_user_rol_id_user_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE ceragen.segu_user_rol_id_user_rol_seq;
       ceragen          uceragen    false    240    6            �           0    0    segu_user_rol_id_user_rol_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE ceragen.segu_user_rol_id_user_rol_seq OWNED BY ceragen.segu_user_rol.id_user_rol;
          ceragen          uceragen    false    241            �            1259    26760    segu_user_user_id_seq    SEQUENCE     �   CREATE SEQUENCE ceragen.segu_user_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE ceragen.segu_user_user_id_seq;
       ceragen          uceragen    false    237    6            �           0    0    segu_user_user_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE ceragen.segu_user_user_id_seq OWNED BY ceragen.segu_user.user_id;
          ceragen          uceragen    false    242                       1259    27454    clinic_allergy_catalog    TABLE     �  CREATE TABLE public.clinic_allergy_catalog (
    al_id integer NOT NULL,
    al_name character varying(100) NOT NULL,
    al_description text,
    al_state boolean DEFAULT true,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 *   DROP TABLE public.clinic_allergy_catalog;
       public         heap    postgres    false                       1259    27453     clinic_allergy_catalog_al_id_seq    SEQUENCE     �   CREATE SEQUENCE public.clinic_allergy_catalog_al_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.clinic_allergy_catalog_al_id_seq;
       public          postgres    false    268            �           0    0     clinic_allergy_catalog_al_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.clinic_allergy_catalog_al_id_seq OWNED BY public.clinic_allergy_catalog.al_id;
          public          postgres    false    267                       1259    27497    clinic_blood_type    TABLE     �  CREATE TABLE public.clinic_blood_type (
    btp_id integer NOT NULL,
    btp_type character varying(3) NOT NULL,
    btp_description text,
    btp_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 %   DROP TABLE public.clinic_blood_type;
       public         heap    postgres    false                       1259    27496    clinic_blood_type_btp_id_seq    SEQUENCE     �   CREATE SEQUENCE public.clinic_blood_type_btp_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 3   DROP SEQUENCE public.clinic_blood_type_btp_id_seq;
       public          postgres    false    274            �           0    0    clinic_blood_type_btp_id_seq    SEQUENCE OWNED BY     ]   ALTER SEQUENCE public.clinic_blood_type_btp_id_seq OWNED BY public.clinic_blood_type.btp_id;
          public          postgres    false    273                       1259    27483    clinic_consent_record    TABLE     1  CREATE TABLE public.clinic_consent_record (
    con_id integer NOT NULL,
    con_patient_id integer NOT NULL,
    con_type character varying(50) NOT NULL,
    con_signed_by character varying(100),
    con_signed_date date NOT NULL,
    con_relationship character varying(50),
    con_notes text,
    user_created character varying(100),
    date_created timestamp without time zone,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 )   DROP TABLE public.clinic_consent_record;
       public         heap    postgres    false                       1259    27482     clinic_consent_record_con_id_seq    SEQUENCE     �   CREATE SEQUENCE public.clinic_consent_record_con_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.clinic_consent_record_con_id_seq;
       public          postgres    false    272            �           0    0     clinic_consent_record_con_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.clinic_consent_record_con_id_seq OWNED BY public.clinic_consent_record.con_id;
          public          postgres    false    271                       1259    27383    clinic_disease_catalog    TABLE     �  CREATE TABLE public.clinic_disease_catalog (
    dis_id integer NOT NULL,
    dis_name character varying(100) NOT NULL,
    dis_description text,
    dis_type_id integer NOT NULL,
    dis_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 *   DROP TABLE public.clinic_disease_catalog;
       public         heap    postgres    false                       1259    27382 !   clinic_disease_catalog_dis_id_seq    SEQUENCE     �   CREATE SEQUENCE public.clinic_disease_catalog_dis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 8   DROP SEQUENCE public.clinic_disease_catalog_dis_id_seq;
       public          postgres    false    264            �           0    0 !   clinic_disease_catalog_dis_id_seq    SEQUENCE OWNED BY     g   ALTER SEQUENCE public.clinic_disease_catalog_dis_id_seq OWNED BY public.clinic_disease_catalog.dis_id;
          public          postgres    false    263                       1259    27373    clinic_disease_type    TABLE     �  CREATE TABLE public.clinic_disease_type (
    dst_id integer NOT NULL,
    dst_name character varying(100) NOT NULL,
    dst_description text,
    dst_state boolean DEFAULT true NOT NULL,
    user_created character varying(100) NOT NULL,
    date_created timestamp without time zone NOT NULL,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 '   DROP TABLE public.clinic_disease_type;
       public         heap    postgres    false                       1259    27372    clinic_disease_type_dst_id_seq    SEQUENCE     �   CREATE SEQUENCE public.clinic_disease_type_dst_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 5   DROP SEQUENCE public.clinic_disease_type_dst_id_seq;
       public          postgres    false    262            �           0    0    clinic_disease_type_dst_id_seq    SEQUENCE OWNED BY     a   ALTER SEQUENCE public.clinic_disease_type_dst_id_seq OWNED BY public.clinic_disease_type.dst_id;
          public          postgres    false    261                       1259    27464    clinic_patient_allergy    TABLE     �  CREATE TABLE public.clinic_patient_allergy (
    pa_id integer NOT NULL,
    pa_patient_id integer NOT NULL,
    pa_allergy_id integer NOT NULL,
    pa_reaction_description text,
    user_created character varying(100),
    date_created timestamp without time zone,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 *   DROP TABLE public.clinic_patient_allergy;
       public         heap    postgres    false                       1259    27463     clinic_patient_allergy_pa_id_seq    SEQUENCE     �   CREATE SEQUENCE public.clinic_patient_allergy_pa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.clinic_patient_allergy_pa_id_seq;
       public          postgres    false    270            �           0    0     clinic_patient_allergy_pa_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.clinic_patient_allergy_pa_id_seq OWNED BY public.clinic_patient_allergy.pa_id;
          public          postgres    false    269            
           1259    27434    clinic_patient_disease    TABLE     �  CREATE TABLE public.clinic_patient_disease (
    pd_id integer NOT NULL,
    pd_patient_id integer NOT NULL,
    pd_disease_id integer NOT NULL,
    pd_is_current boolean DEFAULT true,
    pd_notes text,
    user_created character varying(100),
    date_created timestamp without time zone,
    user_modified character varying(100),
    date_modified timestamp without time zone,
    user_deleted character varying(100),
    date_deleted timestamp without time zone
);
 *   DROP TABLE public.clinic_patient_disease;
       public         heap    postgres    false            	           1259    27433     clinic_patient_disease_pd_id_seq    SEQUENCE     �   CREATE SEQUENCE public.clinic_patient_disease_pd_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 7   DROP SEQUENCE public.clinic_patient_disease_pd_id_seq;
       public          postgres    false    266            �           0    0     clinic_patient_disease_pd_id_seq    SEQUENCE OWNED BY     e   ALTER SEQUENCE public.clinic_patient_disease_pd_id_seq OWNED BY public.clinic_patient_disease.pd_id;
          public          postgres    false    265            �           2604    27360    admin_client cli_id    DEFAULT     |   ALTER TABLE ONLY ceragen.admin_client ALTER COLUMN cli_id SET DEFAULT nextval('ceragen.admin_client_cli_id_seq'::regclass);
 C   ALTER TABLE ceragen.admin_client ALTER COLUMN cli_id DROP DEFAULT;
       ceragen          uceragen    false    260    259    260            �           2604    27284    admin_expense exp_id    DEFAULT     ~   ALTER TABLE ONLY ceragen.admin_expense ALTER COLUMN exp_id SET DEFAULT nextval('ceragen.admin_expense_exp_id_seq'::regclass);
 D   ALTER TABLE ceragen.admin_expense ALTER COLUMN exp_id DROP DEFAULT;
       ceragen          uceragen    false    252    251    252            �           2604    27276    admin_expense_type ext_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_expense_type ALTER COLUMN ext_id SET DEFAULT nextval('ceragen.admin_expense_type_ext_id_seq'::regclass);
 I   ALTER TABLE ceragen.admin_expense_type ALTER COLUMN ext_id DROP DEFAULT;
       ceragen          uceragen    false    250    249    250            �           2604    27702    admin_invoice inv_id    DEFAULT     ~   ALTER TABLE ONLY ceragen.admin_invoice ALTER COLUMN inv_id SET DEFAULT nextval('ceragen.admin_invoice_inv_id_seq'::regclass);
 D   ALTER TABLE ceragen.admin_invoice ALTER COLUMN inv_id DROP DEFAULT;
       ceragen          postgres    false    290    289    290            �           2604    27727    admin_invoice_detail ind_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_invoice_detail ALTER COLUMN ind_id SET DEFAULT nextval('ceragen.admin_invoice_detail_ind_id_seq'::regclass);
 K   ALTER TABLE ceragen.admin_invoice_detail ALTER COLUMN ind_id DROP DEFAULT;
       ceragen          postgres    false    291    292    292            �           2604    27745    admin_invoice_payment inp_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_invoice_payment ALTER COLUMN inp_id SET DEFAULT nextval('ceragen.admin_invoice_payment_inp_id_seq'::regclass);
 L   ALTER TABLE ceragen.admin_invoice_payment ALTER COLUMN inp_id DROP DEFAULT;
       ceragen          postgres    false    293    294    294            �           2604    27775    admin_invoice_tax int_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_invoice_tax ALTER COLUMN int_id SET DEFAULT nextval('ceragen.admin_invoice_tax_int_id_seq'::regclass);
 H   ALTER TABLE ceragen.admin_invoice_tax ALTER COLUMN int_id DROP DEFAULT;
       ceragen          postgres    false    297    298    298            o           2604    26765    admin_marital_status id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_marital_status ALTER COLUMN id SET DEFAULT nextval('ceragen.admin_marital_status_id_seq'::regclass);
 G   ALTER TABLE ceragen.admin_marital_status ALTER COLUMN id DROP DEFAULT;
       ceragen          secoed    false    216    215            �           2604    27240    admin_medic_person_type mpt_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_medic_person_type ALTER COLUMN mpt_id SET DEFAULT nextval('ceragen.admin_medic_person_type_mpt_id_seq'::regclass);
 N   ALTER TABLE ceragen.admin_medic_person_type ALTER COLUMN mpt_id DROP DEFAULT;
       ceragen          uceragen    false    244    243    244            �           2604    27248    admin_medical_staff med_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_medical_staff ALTER COLUMN med_id SET DEFAULT nextval('ceragen.admin_medical_staff_med_id_seq'::regclass);
 J   ALTER TABLE ceragen.admin_medical_staff ALTER COLUMN med_id DROP DEFAULT;
       ceragen          uceragen    false    245    246    246            q           2604    26766    admin_parameter_list pli_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_parameter_list ALTER COLUMN pli_id SET DEFAULT nextval('ceragen.admin_parameter_list_pli_id_seq'::regclass);
 K   ALTER TABLE ceragen.admin_parameter_list ALTER COLUMN pli_id DROP DEFAULT;
       ceragen          uceragen    false    218    217            �           2604    27517    admin_patient pat_id    DEFAULT     ~   ALTER TABLE ONLY ceragen.admin_patient ALTER COLUMN pat_id SET DEFAULT nextval('ceragen.admin_patient_pat_id_seq'::regclass);
 D   ALTER TABLE ceragen.admin_patient ALTER COLUMN pat_id DROP DEFAULT;
       ceragen          uceragen    false    276    275    276            �           2604    27266    admin_payment_method pme_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_payment_method ALTER COLUMN pme_id SET DEFAULT nextval('ceragen.admin_payment_method_pme_id_seq'::regclass);
 K   ALTER TABLE ceragen.admin_payment_method ALTER COLUMN pme_id DROP DEFAULT;
       ceragen          uceragen    false    248    247    248            t           2604    26768    admin_person per_id    DEFAULT     |   ALTER TABLE ONLY ceragen.admin_person ALTER COLUMN per_id SET DEFAULT nextval('ceragen.admin_person_per_id_seq'::regclass);
 C   ALTER TABLE ceragen.admin_person ALTER COLUMN per_id DROP DEFAULT;
       ceragen          uceragen    false    222    219            v           2604    26769    admin_person_genre id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_person_genre ALTER COLUMN id SET DEFAULT nextval('ceragen.admin_person_genre_id_seq'::regclass);
 E   ALTER TABLE ceragen.admin_person_genre ALTER COLUMN id DROP DEFAULT;
       ceragen          uceragen    false    221    220            �           2604    27326    admin_product pro_id    DEFAULT     ~   ALTER TABLE ONLY ceragen.admin_product ALTER COLUMN pro_id SET DEFAULT nextval('ceragen.admin_product_pro_id_seq'::regclass);
 D   ALTER TABLE ceragen.admin_product ALTER COLUMN pro_id DROP DEFAULT;
       ceragen          uceragen    false    255    256    256            �           2604    27343    admin_product_promotion ppr_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_product_promotion ALTER COLUMN ppr_id SET DEFAULT nextval('ceragen.admin_product_promotion_ppr_id_seq'::regclass);
 N   ALTER TABLE ceragen.admin_product_promotion ALTER COLUMN ppr_id DROP DEFAULT;
       ceragen          uceragen    false    258    257    258            �           2604    27765    admin_tax tax_id    DEFAULT     v   ALTER TABLE ONLY ceragen.admin_tax ALTER COLUMN tax_id SET DEFAULT nextval('ceragen.admin_tax_tax_id_seq'::regclass);
 @   ALTER TABLE ceragen.admin_tax ALTER COLUMN tax_id DROP DEFAULT;
       ceragen          postgres    false    296    295    296            �           2604    27316    admin_therapy_type tht_id    DEFAULT     �   ALTER TABLE ONLY ceragen.admin_therapy_type ALTER COLUMN tht_id SET DEFAULT nextval('ceragen.admin_therapy_type_tht_id_seq'::regclass);
 I   ALTER TABLE ceragen.admin_therapy_type ALTER COLUMN tht_id DROP DEFAULT;
       ceragen          uceragen    false    254    253    254            x           2604    26771    audi_sql_events_register ser_id    DEFAULT     �   ALTER TABLE ONLY ceragen.audi_sql_events_register ALTER COLUMN ser_id SET DEFAULT nextval('ceragen.audi_sql_events_register_ser_id_seq'::regclass);
 O   ALTER TABLE ceragen.audi_sql_events_register ALTER COLUMN ser_id DROP DEFAULT;
       ceragen          uceragen    false    224    223            y           2604    26772    audi_tables aut_id    DEFAULT     z   ALTER TABLE ONLY ceragen.audi_tables ALTER COLUMN aut_id SET DEFAULT nextval('ceragen.audi_tables_aut_id_seq'::regclass);
 B   ALTER TABLE ceragen.audi_tables ALTER COLUMN aut_id DROP DEFAULT;
       ceragen          uceragen    false    226    225            �           2604    27629    clinic_allergy_catalog al_id    DEFAULT     �   ALTER TABLE ONLY ceragen.clinic_allergy_catalog ALTER COLUMN al_id SET DEFAULT nextval('ceragen.clinic_allergy_catalog_al_id_seq'::regclass);
 L   ALTER TABLE ceragen.clinic_allergy_catalog ALTER COLUMN al_id DROP DEFAULT;
       ceragen          uceragen    false    285    286    286            �           2604    27594    clinic_disease_catalog dis_id    DEFAULT     �   ALTER TABLE ONLY ceragen.clinic_disease_catalog ALTER COLUMN dis_id SET DEFAULT nextval('ceragen.clinic_disease_catalog_dis_id_seq'::regclass);
 M   ALTER TABLE ceragen.clinic_disease_catalog ALTER COLUMN dis_id DROP DEFAULT;
       ceragen          uceragen    false    281    282    282            �           2604    27584    clinic_disease_type dst_id    DEFAULT     �   ALTER TABLE ONLY ceragen.clinic_disease_type ALTER COLUMN dst_id SET DEFAULT nextval('ceragen.clinic_disease_type_dst_id_seq'::regclass);
 J   ALTER TABLE ceragen.clinic_disease_type ALTER COLUMN dst_id DROP DEFAULT;
       ceragen          uceragen    false    280    279    280            �           2604    27639    clinic_patient_allergy pa_id    DEFAULT     �   ALTER TABLE ONLY ceragen.clinic_patient_allergy ALTER COLUMN pa_id SET DEFAULT nextval('ceragen.clinic_patient_allergy_pa_id_seq'::regclass);
 L   ALTER TABLE ceragen.clinic_patient_allergy ALTER COLUMN pa_id DROP DEFAULT;
       ceragen          uceragen    false    288    287    288            �           2604    27609    clinic_patient_disease pd_id    DEFAULT     �   ALTER TABLE ONLY ceragen.clinic_patient_disease ALTER COLUMN pd_id SET DEFAULT nextval('ceragen.clinic_patient_disease_pd_id_seq'::regclass);
 L   ALTER TABLE ceragen.clinic_patient_disease ALTER COLUMN pd_id DROP DEFAULT;
       ceragen          uceragen    false    283    284    284            �           2604    27540 &   clinic_patient_medical_history hist_id    DEFAULT     �   ALTER TABLE ONLY ceragen.clinic_patient_medical_history ALTER COLUMN hist_id SET DEFAULT nextval('ceragen.clinic_patient_medical_history_hist_id_seq'::regclass);
 V   ALTER TABLE ceragen.clinic_patient_medical_history ALTER COLUMN hist_id DROP DEFAULT;
       ceragen          uceragen    false    278    277    278            �           2604    27902    clinic_session_control sec_id    DEFAULT     �   ALTER TABLE ONLY ceragen.clinic_session_control ALTER COLUMN sec_id SET DEFAULT nextval('ceragen.clinic_session_control_sec_id_seq'::regclass);
 M   ALTER TABLE ceragen.clinic_session_control ALTER COLUMN sec_id DROP DEFAULT;
       ceragen          postgres    false    300    299    300            {           2604    26792    segu_login slo_id    DEFAULT     x   ALTER TABLE ONLY ceragen.segu_login ALTER COLUMN slo_id SET DEFAULT nextval('ceragen.segu_login_slo_id_seq'::regclass);
 A   ALTER TABLE ceragen.segu_login ALTER COLUMN slo_id DROP DEFAULT;
       ceragen          uceragen    false    228    227            |           2604    26793    segu_menu menu_id    DEFAULT     x   ALTER TABLE ONLY ceragen.segu_menu ALTER COLUMN menu_id SET DEFAULT nextval('ceragen.segu_menu_menu_id_seq'::regclass);
 A   ALTER TABLE ceragen.segu_menu ALTER COLUMN menu_id DROP DEFAULT;
       ceragen          uceragen    false    230    229            ~           2604    26794    segu_menu_rol mr_id    DEFAULT     |   ALTER TABLE ONLY ceragen.segu_menu_rol ALTER COLUMN mr_id SET DEFAULT nextval('ceragen.segu_menu_rol_mr_id_seq'::regclass);
 C   ALTER TABLE ceragen.segu_menu_rol ALTER COLUMN mr_id DROP DEFAULT;
       ceragen          uceragen    false    232    231            �           2604    26795    segu_module mod_id    DEFAULT     z   ALTER TABLE ONLY ceragen.segu_module ALTER COLUMN mod_id SET DEFAULT nextval('ceragen.segu_module_mod_id_seq'::regclass);
 B   ALTER TABLE ceragen.segu_module ALTER COLUMN mod_id DROP DEFAULT;
       ceragen          uceragen    false    234    233            �           2604    26796    segu_rol rol_id    DEFAULT     t   ALTER TABLE ONLY ceragen.segu_rol ALTER COLUMN rol_id SET DEFAULT nextval('ceragen.segu_rol_rol_id_seq'::regclass);
 ?   ALTER TABLE ceragen.segu_rol ALTER COLUMN rol_id DROP DEFAULT;
       ceragen          uceragen    false    236    235            �           2604    26797    segu_user user_id    DEFAULT     x   ALTER TABLE ONLY ceragen.segu_user ALTER COLUMN user_id SET DEFAULT nextval('ceragen.segu_user_user_id_seq'::regclass);
 A   ALTER TABLE ceragen.segu_user ALTER COLUMN user_id DROP DEFAULT;
       ceragen          uceragen    false    242    237            �           2604    26798    segu_user_notification sun_id    DEFAULT     �   ALTER TABLE ONLY ceragen.segu_user_notification ALTER COLUMN sun_id SET DEFAULT nextval('ceragen.segu_user_notification_sun_id_seq'::regclass);
 M   ALTER TABLE ceragen.segu_user_notification ALTER COLUMN sun_id DROP DEFAULT;
       ceragen          uceragen    false    239    238            �           2604    26799    segu_user_rol id_user_rol    DEFAULT     �   ALTER TABLE ONLY ceragen.segu_user_rol ALTER COLUMN id_user_rol SET DEFAULT nextval('ceragen.segu_user_rol_id_user_rol_seq'::regclass);
 I   ALTER TABLE ceragen.segu_user_rol ALTER COLUMN id_user_rol DROP DEFAULT;
       ceragen          uceragen    false    241    240            �           2604    27457    clinic_allergy_catalog al_id    DEFAULT     �   ALTER TABLE ONLY public.clinic_allergy_catalog ALTER COLUMN al_id SET DEFAULT nextval('public.clinic_allergy_catalog_al_id_seq'::regclass);
 K   ALTER TABLE public.clinic_allergy_catalog ALTER COLUMN al_id DROP DEFAULT;
       public          postgres    false    267    268    268            �           2604    27500    clinic_blood_type btp_id    DEFAULT     �   ALTER TABLE ONLY public.clinic_blood_type ALTER COLUMN btp_id SET DEFAULT nextval('public.clinic_blood_type_btp_id_seq'::regclass);
 G   ALTER TABLE public.clinic_blood_type ALTER COLUMN btp_id DROP DEFAULT;
       public          postgres    false    274    273    274            �           2604    27486    clinic_consent_record con_id    DEFAULT     �   ALTER TABLE ONLY public.clinic_consent_record ALTER COLUMN con_id SET DEFAULT nextval('public.clinic_consent_record_con_id_seq'::regclass);
 K   ALTER TABLE public.clinic_consent_record ALTER COLUMN con_id DROP DEFAULT;
       public          postgres    false    272    271    272            �           2604    27386    clinic_disease_catalog dis_id    DEFAULT     �   ALTER TABLE ONLY public.clinic_disease_catalog ALTER COLUMN dis_id SET DEFAULT nextval('public.clinic_disease_catalog_dis_id_seq'::regclass);
 L   ALTER TABLE public.clinic_disease_catalog ALTER COLUMN dis_id DROP DEFAULT;
       public          postgres    false    264    263    264            �           2604    27376    clinic_disease_type dst_id    DEFAULT     �   ALTER TABLE ONLY public.clinic_disease_type ALTER COLUMN dst_id SET DEFAULT nextval('public.clinic_disease_type_dst_id_seq'::regclass);
 I   ALTER TABLE public.clinic_disease_type ALTER COLUMN dst_id DROP DEFAULT;
       public          postgres    false    262    261    262            �           2604    27467    clinic_patient_allergy pa_id    DEFAULT     �   ALTER TABLE ONLY public.clinic_patient_allergy ALTER COLUMN pa_id SET DEFAULT nextval('public.clinic_patient_allergy_pa_id_seq'::regclass);
 K   ALTER TABLE public.clinic_patient_allergy ALTER COLUMN pa_id DROP DEFAULT;
       public          postgres    false    270    269    270            �           2604    27437    clinic_patient_disease pd_id    DEFAULT     �   ALTER TABLE ONLY public.clinic_patient_disease ALTER COLUMN pd_id SET DEFAULT nextval('public.clinic_patient_disease_pd_id_seq'::regclass);
 K   ALTER TABLE public.clinic_patient_disease ALTER COLUMN pd_id DROP DEFAULT;
       public          postgres    false    265    266    266            1          0    27357    admin_client 
   TABLE DATA           �   COPY ceragen.admin_client (cli_id, cli_person_id, cli_identification, cli_name, cli_address_bill, cli_mail_bill, cli_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    260   ^      )          0    27281    admin_expense 
   TABLE DATA           �   COPY ceragen.admin_expense (exp_id, exp_type_id, exp_payment_method_id, exp_date, exp_amount, exp_description, exp_receipt_number, exp_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    252   +^      '          0    27273    admin_expense_type 
   TABLE DATA           �   COPY ceragen.admin_expense_type (ext_id, ext_name, ext_description, ext_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    250   H^      O          0    27699    admin_invoice 
   TABLE DATA           �   COPY ceragen.admin_invoice (inv_id, inv_number, inv_date, inv_client_id, inv_patient_id, inv_subtotal, inv_discount, inv_tax, inv_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          postgres    false    290   �^      Q          0    27724    admin_invoice_detail 
   TABLE DATA           �   COPY ceragen.admin_invoice_detail (ind_id, ind_invoice_id, ind_product_id, ind_quantity, ind_unit_price, ind_total, ind_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          postgres    false    292   �^      S          0    27742    admin_invoice_payment 
   TABLE DATA           �   COPY ceragen.admin_invoice_payment (inp_id, inp_invoice_id, inp_payment_method_id, inp_amount, inp_reference, inp_proof_image_path, inp_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          postgres    false    294   �^      W          0    27772    admin_invoice_tax 
   TABLE DATA           �   COPY ceragen.admin_invoice_tax (int_id, int_invoice_id, int_tax_id, int_tax_amount, int_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          postgres    false    298   
_                0    26513    admin_marital_status 
   TABLE DATA           �   COPY ceragen.admin_marital_status (id, status_name, state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          secoed    false    215   '_      !          0    27237    admin_medic_person_type 
   TABLE DATA           �   COPY ceragen.admin_medic_person_type (mpt_id, mpt_name, mpt_description, mpt_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    244   �_      #          0    27245    admin_medical_staff 
   TABLE DATA           �   COPY ceragen.admin_medical_staff (med_id, med_person_id, med_type_id, med_registration_number, med_specialty, med_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    246   e`                0    26518    admin_parameter_list 
   TABLE DATA           �   COPY ceragen.admin_parameter_list (pli_id, pli_code_parameter, pli_is_numeric_return_value, pli_string_value_return, pli_numeric_value_return, pli_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    217   �`      A          0    27514    admin_patient 
   TABLE DATA           )  COPY ceragen.admin_patient (pat_id, pat_person_id, pat_client_id, pat_code, pat_medical_conditions, pat_allergies, pat_blood_type, pat_emergency_contact_name, pat_emergency_contact_phone, pat_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    276   ]a      %          0    27263    admin_payment_method 
   TABLE DATA           �   COPY ceragen.admin_payment_method (pme_id, pme_name, pme_description, pme_require_references, pme_require_picture_proff, pme_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    248   za                0    26534    admin_person 
   TABLE DATA           +  COPY ceragen.admin_person (per_id, per_identification, per_names, per_surnames, per_genre_id, per_marital_status_id, per_country, per_city, per_address, per_phone, per_mail, per_birth_date, per_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    219   *b      	          0    26540    admin_person_genre 
   TABLE DATA           �   COPY ceragen.admin_person_genre (id, genre_name, state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    220   �e      -          0    27323    admin_product 
   TABLE DATA             COPY ceragen.admin_product (pro_id, pro_code, pro_name, pro_description, pro_price, pro_total_sessions, pro_duration_days, pro_image_url, pro_therapy_type_id, pro_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    256   2f      /          0    27340    admin_product_promotion 
   TABLE DATA             COPY ceragen.admin_product_promotion (ppr_id, ppr_product_id, ppr_name, ppr_description, ppr_discount_percent, ppr_extra_sessions, ppr_start_date, ppr_end_date, ppr_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    258   Of      U          0    27762 	   admin_tax 
   TABLE DATA           �   COPY ceragen.admin_tax (tax_id, tax_name, tax_percentage, tax_description, tax_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          postgres    false    296   lf      +          0    27313    admin_therapy_type 
   TABLE DATA           �   COPY ceragen.admin_therapy_type (tht_id, tht_name, tht_description, tht_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    254   �f                0    26553    audi_sql_events_register 
   TABLE DATA           �   COPY ceragen.audi_sql_events_register (ser_id, ser_table_id, ser_sql_command_type, ser_new_record_detail, ser_old_record_detail, ser_user_process_id, ser_date_event) FROM stdin;
    ceragen          uceragen    false    223   �f                0    26559    audi_tables 
   TABLE DATA           �   COPY ceragen.audi_tables (aut_id, aut_table_name, aut_table_descriptiom, aut_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    225   J�      K          0    27626    clinic_allergy_catalog 
   TABLE DATA           �   COPY ceragen.clinic_allergy_catalog (al_id, al_name, al_description, al_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    286   e�      G          0    27591    clinic_disease_catalog 
   TABLE DATA           �   COPY ceragen.clinic_disease_catalog (dis_id, dis_name, dis_description, dis_type_id, dis_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    282   ��      E          0    27581    clinic_disease_type 
   TABLE DATA           �   COPY ceragen.clinic_disease_type (dst_id, dst_name, dst_description, dst_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    280   ��      M          0    27636    clinic_patient_allergy 
   TABLE DATA           �   COPY ceragen.clinic_patient_allergy (pa_id, pa_patient_id, pa_allergy_id, pa_reaction_description, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    288   ��      I          0    27606    clinic_patient_disease 
   TABLE DATA           �   COPY ceragen.clinic_patient_disease (pd_id, pd_patient_id, pd_disease_id, pd_is_current, pd_notes, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    284   ٕ      C          0    27537    clinic_patient_medical_history 
   TABLE DATA             COPY ceragen.clinic_patient_medical_history (hist_id, hist_patient_id, hist_primary_complaint, hist_onset_date, hist_related_trauma, hist_current_treatment, hist_notes, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    278   ��      Y          0    27899    clinic_session_control 
   TABLE DATA             COPY ceragen.clinic_session_control (sec_id, sec_inv_id, sec_pro_id, sec_ses_number, sec_ses_agend_date, sec_ses_exec_date, sec_typ_id, sec_med_staff_id, ses_consumed, ses_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          postgres    false    300   �                0    26702 
   segu_login 
   TABLE DATA           �   COPY ceragen.segu_login (slo_id, slo_user_id, slo_token, slo_origin_ip, slo_host_name, slo_date_start_connection, slo_date_end_connection) FROM stdin;
    ceragen          uceragen    false    227   0�                0    26708 	   segu_menu 
   TABLE DATA           �   COPY ceragen.segu_menu (menu_id, menu_name, menu_order, menu_module_id, menu_parent_id, menu_icon_name, menu_href, menu_url, menu_key, menu_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    229   >�                0    26715    segu_menu_rol 
   TABLE DATA           �   COPY ceragen.segu_menu_rol (mr_id, mr_menu_id, mr_rol_id, mr_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    231   �                0    26720    segu_module 
   TABLE DATA           �   COPY ceragen.segu_module (mod_id, mod_name, mod_description, mod_order, mod_icon_name, mod_text_name, mod_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    233   ߖ                0    26727    segu_rol 
   TABLE DATA           �   COPY ceragen.segu_rol (rol_id, rol_name, rol_description, rol_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted, is_admin_rol) FROM stdin;
    ceragen          uceragen    false    235   ��                0    26735 	   segu_user 
   TABLE DATA             COPY ceragen.segu_user (user_id, user_person_id, user_login_id, user_mail, user_password, user_locked, user_state, user_last_login, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted, login_attempts, twofa_enabled) FROM stdin;
    ceragen          uceragen    false    237   Y�                0    26743    segu_user_notification 
   TABLE DATA           O  COPY ceragen.segu_user_notification (sun_id, sun_user_source_id, sun_user_destination_id, sun_title_notification, sun_text_notification, sun_date_notification, sun_state_notification, sun_isread_notification, sun_date_read_notification, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    ceragen          uceragen    false    238   U�                0    26751    segu_user_rol 
   TABLE DATA           �   COPY ceragen.segu_user_rol (id_user_rol, id_user, id_rol, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted, state) FROM stdin;
    ceragen          uceragen    false    240   r�      9          0    27454    clinic_allergy_catalog 
   TABLE DATA           �   COPY public.clinic_allergy_catalog (al_id, al_name, al_description, al_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    public          postgres    false    268   w�      ?          0    27497    clinic_blood_type 
   TABLE DATA           �   COPY public.clinic_blood_type (btp_id, btp_type, btp_description, btp_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    public          postgres    false    274   ��      =          0    27483    clinic_consent_record 
   TABLE DATA           �   COPY public.clinic_consent_record (con_id, con_patient_id, con_type, con_signed_by, con_signed_date, con_relationship, con_notes, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    public          postgres    false    272   ��      5          0    27383    clinic_disease_catalog 
   TABLE DATA           �   COPY public.clinic_disease_catalog (dis_id, dis_name, dis_description, dis_type_id, dis_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    public          postgres    false    264   Ξ      3          0    27373    clinic_disease_type 
   TABLE DATA           �   COPY public.clinic_disease_type (dst_id, dst_name, dst_description, dst_state, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    public          postgres    false    262   �      ;          0    27464    clinic_patient_allergy 
   TABLE DATA           �   COPY public.clinic_patient_allergy (pa_id, pa_patient_id, pa_allergy_id, pa_reaction_description, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    public          postgres    false    270   �      7          0    27434    clinic_patient_disease 
   TABLE DATA           �   COPY public.clinic_patient_disease (pd_id, pd_patient_id, pd_disease_id, pd_is_current, pd_notes, user_created, date_created, user_modified, date_modified, user_deleted, date_deleted) FROM stdin;
    public          postgres    false    266   %�      �           0    0    admin_client_cli_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('ceragen.admin_client_cli_id_seq', 1, false);
          ceragen          uceragen    false    259            �           0    0    admin_expense_exp_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('ceragen.admin_expense_exp_id_seq', 1, false);
          ceragen          uceragen    false    251            �           0    0    admin_expense_type_ext_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('ceragen.admin_expense_type_ext_id_seq', 2, true);
          ceragen          uceragen    false    249            �           0    0    admin_invoice_detail_ind_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('ceragen.admin_invoice_detail_ind_id_seq', 1, false);
          ceragen          postgres    false    291            �           0    0    admin_invoice_inv_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('ceragen.admin_invoice_inv_id_seq', 1, false);
          ceragen          postgres    false    289            �           0    0     admin_invoice_payment_inp_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('ceragen.admin_invoice_payment_inp_id_seq', 1, false);
          ceragen          postgres    false    293            �           0    0    admin_invoice_tax_int_id_seq    SEQUENCE SET     L   SELECT pg_catalog.setval('ceragen.admin_invoice_tax_int_id_seq', 1, false);
          ceragen          postgres    false    297            �           0    0    admin_marital_status_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('ceragen.admin_marital_status_id_seq', 8, true);
          ceragen          secoed    false    216            �           0    0 "   admin_medic_person_type_mpt_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('ceragen.admin_medic_person_type_mpt_id_seq', 2, true);
          ceragen          uceragen    false    243            �           0    0    admin_medical_staff_med_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('ceragen.admin_medical_staff_med_id_seq', 1, false);
          ceragen          uceragen    false    245            �           0    0    admin_parameter_list_pli_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('ceragen.admin_parameter_list_pli_id_seq', 4, true);
          ceragen          uceragen    false    218            �           0    0    admin_patient_pat_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('ceragen.admin_patient_pat_id_seq', 1, false);
          ceragen          uceragen    false    275            �           0    0    admin_payment_method_pme_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('ceragen.admin_payment_method_pme_id_seq', 3, true);
          ceragen          uceragen    false    247            �           0    0    admin_person_genre_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('ceragen.admin_person_genre_id_seq', 4, true);
          ceragen          uceragen    false    221            �           0    0    admin_person_per_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('ceragen.admin_person_per_id_seq', 42, true);
          ceragen          uceragen    false    222            �           0    0    admin_product_pro_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('ceragen.admin_product_pro_id_seq', 1, false);
          ceragen          uceragen    false    255            �           0    0 "   admin_product_promotion_ppr_id_seq    SEQUENCE SET     R   SELECT pg_catalog.setval('ceragen.admin_product_promotion_ppr_id_seq', 1, false);
          ceragen          uceragen    false    257            �           0    0    admin_tax_tax_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('ceragen.admin_tax_tax_id_seq', 1, false);
          ceragen          postgres    false    295            �           0    0    admin_therapy_type_tht_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('ceragen.admin_therapy_type_tht_id_seq', 1, false);
          ceragen          uceragen    false    253            �           0    0 #   audi_sql_events_register_ser_id_seq    SEQUENCE SET     V   SELECT pg_catalog.setval('ceragen.audi_sql_events_register_ser_id_seq', 11822, true);
          ceragen          uceragen    false    224            �           0    0    audi_tables_aut_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('ceragen.audi_tables_aut_id_seq', 43, true);
          ceragen          uceragen    false    226            �           0    0     clinic_allergy_catalog_al_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('ceragen.clinic_allergy_catalog_al_id_seq', 1, false);
          ceragen          uceragen    false    285            �           0    0 !   clinic_disease_catalog_dis_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('ceragen.clinic_disease_catalog_dis_id_seq', 1, false);
          ceragen          uceragen    false    281            �           0    0    clinic_disease_type_dst_id_seq    SEQUENCE SET     N   SELECT pg_catalog.setval('ceragen.clinic_disease_type_dst_id_seq', 1, false);
          ceragen          uceragen    false    279            �           0    0     clinic_patient_allergy_pa_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('ceragen.clinic_patient_allergy_pa_id_seq', 1, false);
          ceragen          uceragen    false    287            �           0    0     clinic_patient_disease_pd_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('ceragen.clinic_patient_disease_pd_id_seq', 1, false);
          ceragen          uceragen    false    283            �           0    0 *   clinic_patient_medical_history_hist_id_seq    SEQUENCE SET     Z   SELECT pg_catalog.setval('ceragen.clinic_patient_medical_history_hist_id_seq', 1, false);
          ceragen          uceragen    false    277            �           0    0 !   clinic_session_control_sec_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('ceragen.clinic_session_control_sec_id_seq', 1, false);
          ceragen          postgres    false    299            �           0    0    segu_login_slo_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('ceragen.segu_login_slo_id_seq', 889, true);
          ceragen          uceragen    false    228            �           0    0    segu_menu_menu_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('ceragen.segu_menu_menu_id_seq', 69, true);
          ceragen          uceragen    false    230            �           0    0    segu_menu_rol_mr_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('ceragen.segu_menu_rol_mr_id_seq', 88, true);
          ceragen          uceragen    false    232            �           0    0    segu_module_mod_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('ceragen.segu_module_mod_id_seq', 11, true);
          ceragen          uceragen    false    234            �           0    0    segu_rol_rol_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('ceragen.segu_rol_rol_id_seq', 8, true);
          ceragen          uceragen    false    236            �           0    0 !   segu_user_notification_sun_id_seq    SEQUENCE SET     Q   SELECT pg_catalog.setval('ceragen.segu_user_notification_sun_id_seq', 1, false);
          ceragen          uceragen    false    239            �           0    0    segu_user_rol_id_user_rol_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('ceragen.segu_user_rol_id_user_rol_seq', 13, true);
          ceragen          uceragen    false    241            �           0    0    segu_user_user_id_seq    SEQUENCE SET     E   SELECT pg_catalog.setval('ceragen.segu_user_user_id_seq', 11, true);
          ceragen          uceragen    false    242            �           0    0     clinic_allergy_catalog_al_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.clinic_allergy_catalog_al_id_seq', 1, false);
          public          postgres    false    267            �           0    0    clinic_blood_type_btp_id_seq    SEQUENCE SET     K   SELECT pg_catalog.setval('public.clinic_blood_type_btp_id_seq', 1, false);
          public          postgres    false    273            �           0    0     clinic_consent_record_con_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.clinic_consent_record_con_id_seq', 1, false);
          public          postgres    false    271            �           0    0 !   clinic_disease_catalog_dis_id_seq    SEQUENCE SET     P   SELECT pg_catalog.setval('public.clinic_disease_catalog_dis_id_seq', 1, false);
          public          postgres    false    263            �           0    0    clinic_disease_type_dst_id_seq    SEQUENCE SET     M   SELECT pg_catalog.setval('public.clinic_disease_type_dst_id_seq', 1, false);
          public          postgres    false    261            �           0    0     clinic_patient_allergy_pa_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.clinic_patient_allergy_pa_id_seq', 1, false);
          public          postgres    false    269            �           0    0     clinic_patient_disease_pd_id_seq    SEQUENCE SET     O   SELECT pg_catalog.setval('public.clinic_patient_disease_pd_id_seq', 1, false);
          public          postgres    false    265                       2606    27365    admin_client admin_client_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY ceragen.admin_client
    ADD CONSTRAINT admin_client_pkey PRIMARY KEY (cli_id);
 I   ALTER TABLE ONLY ceragen.admin_client DROP CONSTRAINT admin_client_pkey;
       ceragen            uceragen    false    260            �           2606    27289     admin_expense admin_expense_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY ceragen.admin_expense
    ADD CONSTRAINT admin_expense_pkey PRIMARY KEY (exp_id);
 K   ALTER TABLE ONLY ceragen.admin_expense DROP CONSTRAINT admin_expense_pkey;
       ceragen            uceragen    false    252            �           2606    27279 *   admin_expense_type admin_expense_type_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY ceragen.admin_expense_type
    ADD CONSTRAINT admin_expense_type_pkey PRIMARY KEY (ext_id);
 U   ALTER TABLE ONLY ceragen.admin_expense_type DROP CONSTRAINT admin_expense_type_pkey;
       ceragen            uceragen    false    250            (           2606    27730 .   admin_invoice_detail admin_invoice_detail_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY ceragen.admin_invoice_detail
    ADD CONSTRAINT admin_invoice_detail_pkey PRIMARY KEY (ind_id);
 Y   ALTER TABLE ONLY ceragen.admin_invoice_detail DROP CONSTRAINT admin_invoice_detail_pkey;
       ceragen            postgres    false    292            $           2606    27711 *   admin_invoice admin_invoice_inv_number_key 
   CONSTRAINT     l   ALTER TABLE ONLY ceragen.admin_invoice
    ADD CONSTRAINT admin_invoice_inv_number_key UNIQUE (inv_number);
 U   ALTER TABLE ONLY ceragen.admin_invoice DROP CONSTRAINT admin_invoice_inv_number_key;
       ceragen            postgres    false    290            *           2606    27750 0   admin_invoice_payment admin_invoice_payment_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY ceragen.admin_invoice_payment
    ADD CONSTRAINT admin_invoice_payment_pkey PRIMARY KEY (inp_id);
 [   ALTER TABLE ONLY ceragen.admin_invoice_payment DROP CONSTRAINT admin_invoice_payment_pkey;
       ceragen            postgres    false    294            &           2606    27709     admin_invoice admin_invoice_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY ceragen.admin_invoice
    ADD CONSTRAINT admin_invoice_pkey PRIMARY KEY (inv_id);
 K   ALTER TABLE ONLY ceragen.admin_invoice DROP CONSTRAINT admin_invoice_pkey;
       ceragen            postgres    false    290            .           2606    27778 (   admin_invoice_tax admin_invoice_tax_pkey 
   CONSTRAINT     k   ALTER TABLE ONLY ceragen.admin_invoice_tax
    ADD CONSTRAINT admin_invoice_tax_pkey PRIMARY KEY (int_id);
 S   ALTER TABLE ONLY ceragen.admin_invoice_tax DROP CONSTRAINT admin_invoice_tax_pkey;
       ceragen            postgres    false    298            �           2606    26810 .   admin_marital_status admin_marital_status_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY ceragen.admin_marital_status
    ADD CONSTRAINT admin_marital_status_pkey PRIMARY KEY (id);
 Y   ALTER TABLE ONLY ceragen.admin_marital_status DROP CONSTRAINT admin_marital_status_pkey;
       ceragen            secoed    false    215            �           2606    27243 4   admin_medic_person_type admin_medic_person_type_pkey 
   CONSTRAINT     w   ALTER TABLE ONLY ceragen.admin_medic_person_type
    ADD CONSTRAINT admin_medic_person_type_pkey PRIMARY KEY (mpt_id);
 _   ALTER TABLE ONLY ceragen.admin_medic_person_type DROP CONSTRAINT admin_medic_person_type_pkey;
       ceragen            uceragen    false    244            �           2606    27251 ,   admin_medical_staff admin_medical_staff_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY ceragen.admin_medical_staff
    ADD CONSTRAINT admin_medical_staff_pkey PRIMARY KEY (med_id);
 W   ALTER TABLE ONLY ceragen.admin_medical_staff DROP CONSTRAINT admin_medical_staff_pkey;
       ceragen            uceragen    false    246            �           2606    26812 .   admin_parameter_list admin_parameter_list_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY ceragen.admin_parameter_list
    ADD CONSTRAINT admin_parameter_list_pkey PRIMARY KEY (pli_id);
 Y   ALTER TABLE ONLY ceragen.admin_parameter_list DROP CONSTRAINT admin_parameter_list_pkey;
       ceragen            uceragen    false    217                       2606    27524 (   admin_patient admin_patient_pat_code_key 
   CONSTRAINT     h   ALTER TABLE ONLY ceragen.admin_patient
    ADD CONSTRAINT admin_patient_pat_code_key UNIQUE (pat_code);
 S   ALTER TABLE ONLY ceragen.admin_patient DROP CONSTRAINT admin_patient_pat_code_key;
       ceragen            uceragen    false    276                       2606    27522     admin_patient admin_patient_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY ceragen.admin_patient
    ADD CONSTRAINT admin_patient_pkey PRIMARY KEY (pat_id);
 K   ALTER TABLE ONLY ceragen.admin_patient DROP CONSTRAINT admin_patient_pkey;
       ceragen            uceragen    false    276            �           2606    27271 .   admin_payment_method admin_payment_method_pkey 
   CONSTRAINT     q   ALTER TABLE ONLY ceragen.admin_payment_method
    ADD CONSTRAINT admin_payment_method_pkey PRIMARY KEY (pme_id);
 Y   ALTER TABLE ONLY ceragen.admin_payment_method DROP CONSTRAINT admin_payment_method_pkey;
       ceragen            uceragen    false    248            �           2606    26818 *   admin_person_genre admin_person_genre_pkey 
   CONSTRAINT     i   ALTER TABLE ONLY ceragen.admin_person_genre
    ADD CONSTRAINT admin_person_genre_pkey PRIMARY KEY (id);
 U   ALTER TABLE ONLY ceragen.admin_person_genre DROP CONSTRAINT admin_person_genre_pkey;
       ceragen            uceragen    false    220            �           2606    26820 0   admin_person admin_person_per_identification_key 
   CONSTRAINT     z   ALTER TABLE ONLY ceragen.admin_person
    ADD CONSTRAINT admin_person_per_identification_key UNIQUE (per_identification);
 [   ALTER TABLE ONLY ceragen.admin_person DROP CONSTRAINT admin_person_per_identification_key;
       ceragen            uceragen    false    219            �           2606    26822    admin_person admin_person_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY ceragen.admin_person
    ADD CONSTRAINT admin_person_pkey PRIMARY KEY (per_id);
 I   ALTER TABLE ONLY ceragen.admin_person DROP CONSTRAINT admin_person_pkey;
       ceragen            uceragen    false    219            �           2606    27331     admin_product admin_product_pkey 
   CONSTRAINT     c   ALTER TABLE ONLY ceragen.admin_product
    ADD CONSTRAINT admin_product_pkey PRIMARY KEY (pro_id);
 K   ALTER TABLE ONLY ceragen.admin_product DROP CONSTRAINT admin_product_pkey;
       ceragen            uceragen    false    256            �           2606    27333 (   admin_product admin_product_pro_code_key 
   CONSTRAINT     h   ALTER TABLE ONLY ceragen.admin_product
    ADD CONSTRAINT admin_product_pro_code_key UNIQUE (pro_code);
 S   ALTER TABLE ONLY ceragen.admin_product DROP CONSTRAINT admin_product_pro_code_key;
       ceragen            uceragen    false    256                        2606    27350 4   admin_product_promotion admin_product_promotion_pkey 
   CONSTRAINT     w   ALTER TABLE ONLY ceragen.admin_product_promotion
    ADD CONSTRAINT admin_product_promotion_pkey PRIMARY KEY (ppr_id);
 _   ALTER TABLE ONLY ceragen.admin_product_promotion DROP CONSTRAINT admin_product_promotion_pkey;
       ceragen            uceragen    false    258            ,           2606    27770    admin_tax admin_tax_pkey 
   CONSTRAINT     [   ALTER TABLE ONLY ceragen.admin_tax
    ADD CONSTRAINT admin_tax_pkey PRIMARY KEY (tax_id);
 C   ALTER TABLE ONLY ceragen.admin_tax DROP CONSTRAINT admin_tax_pkey;
       ceragen            postgres    false    296            �           2606    27321 *   admin_therapy_type admin_therapy_type_pkey 
   CONSTRAINT     m   ALTER TABLE ONLY ceragen.admin_therapy_type
    ADD CONSTRAINT admin_therapy_type_pkey PRIMARY KEY (tht_id);
 U   ALTER TABLE ONLY ceragen.admin_therapy_type DROP CONSTRAINT admin_therapy_type_pkey;
       ceragen            uceragen    false    254            �           2606    26826 6   audi_sql_events_register audi_sql_events_register_pkey 
   CONSTRAINT     y   ALTER TABLE ONLY ceragen.audi_sql_events_register
    ADD CONSTRAINT audi_sql_events_register_pkey PRIMARY KEY (ser_id);
 a   ALTER TABLE ONLY ceragen.audi_sql_events_register DROP CONSTRAINT audi_sql_events_register_pkey;
       ceragen            uceragen    false    223            �           2606    26828    audi_tables audi_tables_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY ceragen.audi_tables
    ADD CONSTRAINT audi_tables_pkey PRIMARY KEY (aut_id);
 G   ALTER TABLE ONLY ceragen.audi_tables DROP CONSTRAINT audi_tables_pkey;
       ceragen            uceragen    false    225                        2606    27634 2   clinic_allergy_catalog clinic_allergy_catalog_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY ceragen.clinic_allergy_catalog
    ADD CONSTRAINT clinic_allergy_catalog_pkey PRIMARY KEY (al_id);
 ]   ALTER TABLE ONLY ceragen.clinic_allergy_catalog DROP CONSTRAINT clinic_allergy_catalog_pkey;
       ceragen            uceragen    false    286                       2606    27599 2   clinic_disease_catalog clinic_disease_catalog_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY ceragen.clinic_disease_catalog
    ADD CONSTRAINT clinic_disease_catalog_pkey PRIMARY KEY (dis_id);
 ]   ALTER TABLE ONLY ceragen.clinic_disease_catalog DROP CONSTRAINT clinic_disease_catalog_pkey;
       ceragen            uceragen    false    282                       2606    27589 ,   clinic_disease_type clinic_disease_type_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY ceragen.clinic_disease_type
    ADD CONSTRAINT clinic_disease_type_pkey PRIMARY KEY (dst_id);
 W   ALTER TABLE ONLY ceragen.clinic_disease_type DROP CONSTRAINT clinic_disease_type_pkey;
       ceragen            uceragen    false    280            "           2606    27643 2   clinic_patient_allergy clinic_patient_allergy_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY ceragen.clinic_patient_allergy
    ADD CONSTRAINT clinic_patient_allergy_pkey PRIMARY KEY (pa_id);
 ]   ALTER TABLE ONLY ceragen.clinic_patient_allergy DROP CONSTRAINT clinic_patient_allergy_pkey;
       ceragen            uceragen    false    288                       2606    27614 2   clinic_patient_disease clinic_patient_disease_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY ceragen.clinic_patient_disease
    ADD CONSTRAINT clinic_patient_disease_pkey PRIMARY KEY (pd_id);
 ]   ALTER TABLE ONLY ceragen.clinic_patient_disease DROP CONSTRAINT clinic_patient_disease_pkey;
       ceragen            uceragen    false    284                       2606    27544 B   clinic_patient_medical_history clinic_patient_medical_history_pkey 
   CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_patient_medical_history
    ADD CONSTRAINT clinic_patient_medical_history_pkey PRIMARY KEY (hist_id);
 m   ALTER TABLE ONLY ceragen.clinic_patient_medical_history DROP CONSTRAINT clinic_patient_medical_history_pkey;
       ceragen            uceragen    false    278            0           2606    27906 2   clinic_session_control clinic_session_control_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY ceragen.clinic_session_control
    ADD CONSTRAINT clinic_session_control_pkey PRIMARY KEY (sec_id);
 ]   ALTER TABLE ONLY ceragen.clinic_session_control DROP CONSTRAINT clinic_session_control_pkey;
       ceragen            postgres    false    300            �           2606    26872    segu_login segu_login_pkey 
   CONSTRAINT     ]   ALTER TABLE ONLY ceragen.segu_login
    ADD CONSTRAINT segu_login_pkey PRIMARY KEY (slo_id);
 E   ALTER TABLE ONLY ceragen.segu_login DROP CONSTRAINT segu_login_pkey;
       ceragen            uceragen    false    227            �           2606    26874    segu_menu segu_menu_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY ceragen.segu_menu
    ADD CONSTRAINT segu_menu_pkey PRIMARY KEY (menu_id);
 C   ALTER TABLE ONLY ceragen.segu_menu DROP CONSTRAINT segu_menu_pkey;
       ceragen            uceragen    false    229            �           2606    26876     segu_menu_rol segu_menu_rol_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY ceragen.segu_menu_rol
    ADD CONSTRAINT segu_menu_rol_pkey PRIMARY KEY (mr_id);
 K   ALTER TABLE ONLY ceragen.segu_menu_rol DROP CONSTRAINT segu_menu_rol_pkey;
       ceragen            uceragen    false    231            �           2606    26878    segu_module segu_module_pkey 
   CONSTRAINT     _   ALTER TABLE ONLY ceragen.segu_module
    ADD CONSTRAINT segu_module_pkey PRIMARY KEY (mod_id);
 G   ALTER TABLE ONLY ceragen.segu_module DROP CONSTRAINT segu_module_pkey;
       ceragen            uceragen    false    233            �           2606    26880    segu_rol segu_rol_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY ceragen.segu_rol
    ADD CONSTRAINT segu_rol_pkey PRIMARY KEY (rol_id);
 A   ALTER TABLE ONLY ceragen.segu_rol DROP CONSTRAINT segu_rol_pkey;
       ceragen            uceragen    false    235            �           2606    26882 2   segu_user_notification segu_user_notification_pkey 
   CONSTRAINT     u   ALTER TABLE ONLY ceragen.segu_user_notification
    ADD CONSTRAINT segu_user_notification_pkey PRIMARY KEY (sun_id);
 ]   ALTER TABLE ONLY ceragen.segu_user_notification DROP CONSTRAINT segu_user_notification_pkey;
       ceragen            uceragen    false    238            �           2606    26884    segu_user segu_user_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY ceragen.segu_user
    ADD CONSTRAINT segu_user_pkey PRIMARY KEY (user_id);
 C   ALTER TABLE ONLY ceragen.segu_user DROP CONSTRAINT segu_user_pkey;
       ceragen            uceragen    false    237            �           2606    26888     segu_user_rol segu_user_rol_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY ceragen.segu_user_rol
    ADD CONSTRAINT segu_user_rol_pkey PRIMARY KEY (id_user_rol);
 K   ALTER TABLE ONLY ceragen.segu_user_rol DROP CONSTRAINT segu_user_rol_pkey;
       ceragen            uceragen    false    240            �           2606    26890 %   segu_user segu_user_user_login_id_key 
   CONSTRAINT     j   ALTER TABLE ONLY ceragen.segu_user
    ADD CONSTRAINT segu_user_user_login_id_key UNIQUE (user_login_id);
 P   ALTER TABLE ONLY ceragen.segu_user DROP CONSTRAINT segu_user_user_login_id_key;
       ceragen            uceragen    false    237            �           2606    26892 !   segu_user segu_user_user_mail_key 
   CONSTRAINT     b   ALTER TABLE ONLY ceragen.segu_user
    ADD CONSTRAINT segu_user_user_mail_key UNIQUE (user_mail);
 L   ALTER TABLE ONLY ceragen.segu_user DROP CONSTRAINT segu_user_user_mail_key;
       ceragen            uceragen    false    237            
           2606    27462 2   clinic_allergy_catalog clinic_allergy_catalog_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.clinic_allergy_catalog
    ADD CONSTRAINT clinic_allergy_catalog_pkey PRIMARY KEY (al_id);
 \   ALTER TABLE ONLY public.clinic_allergy_catalog DROP CONSTRAINT clinic_allergy_catalog_pkey;
       public            postgres    false    268                       2606    27507 0   clinic_blood_type clinic_blood_type_btp_type_key 
   CONSTRAINT     o   ALTER TABLE ONLY public.clinic_blood_type
    ADD CONSTRAINT clinic_blood_type_btp_type_key UNIQUE (btp_type);
 Z   ALTER TABLE ONLY public.clinic_blood_type DROP CONSTRAINT clinic_blood_type_btp_type_key;
       public            postgres    false    274                       2606    27505 (   clinic_blood_type clinic_blood_type_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.clinic_blood_type
    ADD CONSTRAINT clinic_blood_type_pkey PRIMARY KEY (btp_id);
 R   ALTER TABLE ONLY public.clinic_blood_type DROP CONSTRAINT clinic_blood_type_pkey;
       public            postgres    false    274                       2606    27490 0   clinic_consent_record clinic_consent_record_pkey 
   CONSTRAINT     r   ALTER TABLE ONLY public.clinic_consent_record
    ADD CONSTRAINT clinic_consent_record_pkey PRIMARY KEY (con_id);
 Z   ALTER TABLE ONLY public.clinic_consent_record DROP CONSTRAINT clinic_consent_record_pkey;
       public            postgres    false    272                       2606    27391 2   clinic_disease_catalog clinic_disease_catalog_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public.clinic_disease_catalog
    ADD CONSTRAINT clinic_disease_catalog_pkey PRIMARY KEY (dis_id);
 \   ALTER TABLE ONLY public.clinic_disease_catalog DROP CONSTRAINT clinic_disease_catalog_pkey;
       public            postgres    false    264                       2606    27381 ,   clinic_disease_type clinic_disease_type_pkey 
   CONSTRAINT     n   ALTER TABLE ONLY public.clinic_disease_type
    ADD CONSTRAINT clinic_disease_type_pkey PRIMARY KEY (dst_id);
 V   ALTER TABLE ONLY public.clinic_disease_type DROP CONSTRAINT clinic_disease_type_pkey;
       public            postgres    false    262                       2606    27471 2   clinic_patient_allergy clinic_patient_allergy_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.clinic_patient_allergy
    ADD CONSTRAINT clinic_patient_allergy_pkey PRIMARY KEY (pa_id);
 \   ALTER TABLE ONLY public.clinic_patient_allergy DROP CONSTRAINT clinic_patient_allergy_pkey;
       public            postgres    false    270                       2606    27442 2   clinic_patient_disease clinic_patient_disease_pkey 
   CONSTRAINT     s   ALTER TABLE ONLY public.clinic_patient_disease
    ADD CONSTRAINT clinic_patient_disease_pkey PRIMARY KEY (pd_id);
 \   ALTER TABLE ONLY public.clinic_patient_disease DROP CONSTRAINT clinic_patient_disease_pkey;
       public            postgres    false    266            _           2620    26894 4   admin_parameter_list tgr_insert_admin_parameter_list    TRIGGER     �   CREATE TRIGGER tgr_insert_admin_parameter_list BEFORE INSERT ON ceragen.admin_parameter_list FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 N   DROP TRIGGER tgr_insert_admin_parameter_list ON ceragen.admin_parameter_list;
       ceragen          uceragen    false    312    217            e           2620    26895 "   audi_tables tgr_insert_audi_tables    TRIGGER     �   CREATE TRIGGER tgr_insert_audi_tables BEFORE INSERT ON ceragen.audi_tables FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 <   DROP TRIGGER tgr_insert_audi_tables ON ceragen.audi_tables;
       ceragen          uceragen    false    312    225            `           2620    26904 4   admin_parameter_list tgr_update_admin_parameter_list    TRIGGER     �   CREATE TRIGGER tgr_update_admin_parameter_list BEFORE DELETE OR UPDATE ON ceragen.admin_parameter_list FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 N   DROP TRIGGER tgr_update_admin_parameter_list ON ceragen.admin_parameter_list;
       ceragen          uceragen    false    217    314            f           2620    26905 "   audi_tables tgr_update_audi_tables    TRIGGER     �   CREATE TRIGGER tgr_update_audi_tables BEFORE UPDATE ON ceragen.audi_tables FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 <   DROP TRIGGER tgr_update_audi_tables ON ceragen.audi_tables;
       ceragen          uceragen    false    225    314            ]           2620    26918 4   admin_marital_status trg_insert_admin_marital_status    TRIGGER     �   CREATE TRIGGER trg_insert_admin_marital_status BEFORE INSERT ON ceragen.admin_marital_status FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 N   DROP TRIGGER trg_insert_admin_marital_status ON ceragen.admin_marital_status;
       ceragen          secoed    false    312    215            a           2620    26920 $   admin_person trg_insert_admin_person    TRIGGER     �   CREATE TRIGGER trg_insert_admin_person BEFORE INSERT ON ceragen.admin_person FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 >   DROP TRIGGER trg_insert_admin_person ON ceragen.admin_person;
       ceragen          uceragen    false    312    219            c           2620    26921 0   admin_person_genre trg_insert_admin_person_genre    TRIGGER     �   CREATE TRIGGER trg_insert_admin_person_genre BEFORE INSERT ON ceragen.admin_person_genre FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 J   DROP TRIGGER trg_insert_admin_person_genre ON ceragen.admin_person_genre;
       ceragen          uceragen    false    312    220            g           2620    26937     segu_login trg_insert_segu_login    TRIGGER     �   CREATE TRIGGER trg_insert_segu_login BEFORE INSERT ON ceragen.segu_login FOR EACH ROW EXECUTE FUNCTION ceragen.register_login_event();
 :   DROP TRIGGER trg_insert_segu_login ON ceragen.segu_login;
       ceragen          uceragen    false    227    313            h           2620    26938    segu_menu trg_insert_segu_menu    TRIGGER     �   CREATE TRIGGER trg_insert_segu_menu BEFORE INSERT ON ceragen.segu_menu FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 8   DROP TRIGGER trg_insert_segu_menu ON ceragen.segu_menu;
       ceragen          uceragen    false    312    229            j           2620    26939 &   segu_menu_rol trg_insert_segu_menu_rol    TRIGGER     �   CREATE TRIGGER trg_insert_segu_menu_rol BEFORE INSERT ON ceragen.segu_menu_rol FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 @   DROP TRIGGER trg_insert_segu_menu_rol ON ceragen.segu_menu_rol;
       ceragen          uceragen    false    231    312            l           2620    26940 "   segu_module trg_insert_segu_module    TRIGGER     �   CREATE TRIGGER trg_insert_segu_module BEFORE INSERT ON ceragen.segu_module FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 <   DROP TRIGGER trg_insert_segu_module ON ceragen.segu_module;
       ceragen          uceragen    false    312    233            n           2620    26941    segu_rol trg_insert_segu_rol    TRIGGER     �   CREATE TRIGGER trg_insert_segu_rol BEFORE INSERT ON ceragen.segu_rol FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 6   DROP TRIGGER trg_insert_segu_rol ON ceragen.segu_rol;
       ceragen          uceragen    false    312    235            p           2620    26942    segu_user trg_insert_segu_user    TRIGGER     �   CREATE TRIGGER trg_insert_segu_user BEFORE INSERT ON ceragen.segu_user FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 8   DROP TRIGGER trg_insert_segu_user ON ceragen.segu_user;
       ceragen          uceragen    false    312    237            r           2620    26943 8   segu_user_notification trg_insert_segu_user_notification    TRIGGER     �   CREATE TRIGGER trg_insert_segu_user_notification BEFORE INSERT ON ceragen.segu_user_notification FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 R   DROP TRIGGER trg_insert_segu_user_notification ON ceragen.segu_user_notification;
       ceragen          uceragen    false    238    312            t           2620    26944 &   segu_user_rol trg_insert_segu_user_rol    TRIGGER     �   CREATE TRIGGER trg_insert_segu_user_rol BEFORE INSERT ON ceragen.segu_user_rol FOR EACH ROW EXECUTE FUNCTION ceragen.register_insert_event();
 @   DROP TRIGGER trg_insert_segu_user_rol ON ceragen.segu_user_rol;
       ceragen          uceragen    false    312    240            ^           2620    26950 4   admin_marital_status trg_update_admin_marital_status    TRIGGER     �   CREATE TRIGGER trg_update_admin_marital_status BEFORE UPDATE ON ceragen.admin_marital_status FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 N   DROP TRIGGER trg_update_admin_marital_status ON ceragen.admin_marital_status;
       ceragen          secoed    false    314    215            b           2620    26952 $   admin_person trg_update_admin_person    TRIGGER     �   CREATE TRIGGER trg_update_admin_person BEFORE UPDATE ON ceragen.admin_person FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 >   DROP TRIGGER trg_update_admin_person ON ceragen.admin_person;
       ceragen          uceragen    false    219    314            d           2620    26953 0   admin_person_genre trg_update_admin_person_genre    TRIGGER     �   CREATE TRIGGER trg_update_admin_person_genre BEFORE UPDATE ON ceragen.admin_person_genre FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 J   DROP TRIGGER trg_update_admin_person_genre ON ceragen.admin_person_genre;
       ceragen          uceragen    false    220    314            i           2620    26976    segu_menu trg_update_segu_menu    TRIGGER     �   CREATE TRIGGER trg_update_segu_menu BEFORE UPDATE ON ceragen.segu_menu FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 8   DROP TRIGGER trg_update_segu_menu ON ceragen.segu_menu;
       ceragen          uceragen    false    229    314            k           2620    26977 &   segu_menu_rol trg_update_segu_menu_rol    TRIGGER     �   CREATE TRIGGER trg_update_segu_menu_rol BEFORE UPDATE ON ceragen.segu_menu_rol FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 @   DROP TRIGGER trg_update_segu_menu_rol ON ceragen.segu_menu_rol;
       ceragen          uceragen    false    231    314            m           2620    26978 "   segu_module trg_update_segu_module    TRIGGER     �   CREATE TRIGGER trg_update_segu_module BEFORE UPDATE ON ceragen.segu_module FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 <   DROP TRIGGER trg_update_segu_module ON ceragen.segu_module;
       ceragen          uceragen    false    314    233            o           2620    26979    segu_rol trg_update_segu_rol    TRIGGER     �   CREATE TRIGGER trg_update_segu_rol BEFORE UPDATE ON ceragen.segu_rol FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 6   DROP TRIGGER trg_update_segu_rol ON ceragen.segu_rol;
       ceragen          uceragen    false    235    314            q           2620    26980    segu_user trg_update_segu_user    TRIGGER     �   CREATE TRIGGER trg_update_segu_user BEFORE UPDATE ON ceragen.segu_user FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 8   DROP TRIGGER trg_update_segu_user ON ceragen.segu_user;
       ceragen          uceragen    false    314    237            s           2620    26981 8   segu_user_notification trg_update_segu_user_notification    TRIGGER     �   CREATE TRIGGER trg_update_segu_user_notification BEFORE UPDATE ON ceragen.segu_user_notification FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 R   DROP TRIGGER trg_update_segu_user_notification ON ceragen.segu_user_notification;
       ceragen          uceragen    false    314    238            u           2620    26982 &   segu_user_rol trg_update_segu_user_rol    TRIGGER     �   CREATE TRIGGER trg_update_segu_user_rol BEFORE UPDATE ON ceragen.segu_user_rol FOR EACH ROW EXECUTE FUNCTION ceragen.register_update_event();
 @   DROP TRIGGER trg_update_segu_user_rol ON ceragen.segu_user_rol;
       ceragen          uceragen    false    314    240            3           2606    27004 C   audi_sql_events_register audi_sql_events_register_ser_table_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.audi_sql_events_register
    ADD CONSTRAINT audi_sql_events_register_ser_table_id_fkey FOREIGN KEY (ser_table_id) REFERENCES ceragen.audi_tables(aut_id);
 n   ALTER TABLE ONLY ceragen.audi_sql_events_register DROP CONSTRAINT audi_sql_events_register_ser_table_id_fkey;
       ceragen          uceragen    false    225    3546    223            4           2606    27009 J   audi_sql_events_register audi_sql_events_register_ser_user_process_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.audi_sql_events_register
    ADD CONSTRAINT audi_sql_events_register_ser_user_process_id_fkey FOREIGN KEY (ser_user_process_id) REFERENCES ceragen.segu_user(user_id);
 u   ALTER TABLE ONLY ceragen.audi_sql_events_register DROP CONSTRAINT audi_sql_events_register_ser_user_process_id_fkey;
       ceragen          uceragen    false    3558    237    223            E           2606    27366    admin_client fk_client_person    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_client
    ADD CONSTRAINT fk_client_person FOREIGN KEY (cli_person_id) REFERENCES ceragen.admin_person(per_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 H   ALTER TABLE ONLY ceragen.admin_client DROP CONSTRAINT fk_client_person;
       ceragen          uceragen    false    219    260    3540            L           2606    27600 "   clinic_disease_catalog fk_dis_type    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_disease_catalog
    ADD CONSTRAINT fk_dis_type FOREIGN KEY (dis_type_id) REFERENCES ceragen.clinic_disease_type(dst_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 M   ALTER TABLE ONLY ceragen.clinic_disease_catalog DROP CONSTRAINT fk_dis_type;
       ceragen          uceragen    false    282    3610    280            A           2606    27290    admin_expense fk_expense_type    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_expense
    ADD CONSTRAINT fk_expense_type FOREIGN KEY (exp_type_id) REFERENCES ceragen.admin_expense_type(ext_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 H   ALTER TABLE ONLY ceragen.admin_expense DROP CONSTRAINT fk_expense_type;
       ceragen          uceragen    false    252    250    3574            K           2606    27545 .   clinic_patient_medical_history fk_hist_patient    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_patient_medical_history
    ADD CONSTRAINT fk_hist_patient FOREIGN KEY (hist_patient_id) REFERENCES ceragen.admin_patient(pat_id) ON UPDATE RESTRICT ON DELETE CASCADE;
 Y   ALTER TABLE ONLY ceragen.clinic_patient_medical_history DROP CONSTRAINT fk_hist_patient;
       ceragen          uceragen    false    3606    278    276            S           2606    27731 #   admin_invoice_detail fk_ind_invoice    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_invoice_detail
    ADD CONSTRAINT fk_ind_invoice FOREIGN KEY (ind_invoice_id) REFERENCES ceragen.admin_invoice(inv_id) ON UPDATE RESTRICT ON DELETE CASCADE;
 N   ALTER TABLE ONLY ceragen.admin_invoice_detail DROP CONSTRAINT fk_ind_invoice;
       ceragen          postgres    false    3622    290    292            T           2606    27736 #   admin_invoice_detail fk_ind_product    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_invoice_detail
    ADD CONSTRAINT fk_ind_product FOREIGN KEY (ind_product_id) REFERENCES ceragen.admin_product(pro_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 N   ALTER TABLE ONLY ceragen.admin_invoice_detail DROP CONSTRAINT fk_ind_product;
       ceragen          postgres    false    256    292    3580            U           2606    27751 $   admin_invoice_payment fk_inp_invoice    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_invoice_payment
    ADD CONSTRAINT fk_inp_invoice FOREIGN KEY (inp_invoice_id) REFERENCES ceragen.admin_invoice(inv_id) ON UPDATE RESTRICT ON DELETE CASCADE;
 O   ALTER TABLE ONLY ceragen.admin_invoice_payment DROP CONSTRAINT fk_inp_invoice;
       ceragen          postgres    false    3622    290    294            V           2606    27756 +   admin_invoice_payment fk_inp_payment_method    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_invoice_payment
    ADD CONSTRAINT fk_inp_payment_method FOREIGN KEY (inp_payment_method_id) REFERENCES ceragen.admin_payment_method(pme_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 V   ALTER TABLE ONLY ceragen.admin_invoice_payment DROP CONSTRAINT fk_inp_payment_method;
       ceragen          postgres    false    3572    248    294            W           2606    27779     admin_invoice_tax fk_int_invoice    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_invoice_tax
    ADD CONSTRAINT fk_int_invoice FOREIGN KEY (int_invoice_id) REFERENCES ceragen.admin_invoice(inv_id) ON UPDATE RESTRICT ON DELETE CASCADE;
 K   ALTER TABLE ONLY ceragen.admin_invoice_tax DROP CONSTRAINT fk_int_invoice;
       ceragen          postgres    false    298    3622    290            X           2606    27784    admin_invoice_tax fk_int_tax    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_invoice_tax
    ADD CONSTRAINT fk_int_tax FOREIGN KEY (int_tax_id) REFERENCES ceragen.admin_tax(tax_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 G   ALTER TABLE ONLY ceragen.admin_invoice_tax DROP CONSTRAINT fk_int_tax;
       ceragen          postgres    false    296    298    3628            Q           2606    27712    admin_invoice fk_invoice_client    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_invoice
    ADD CONSTRAINT fk_invoice_client FOREIGN KEY (inv_client_id) REFERENCES ceragen.admin_person(per_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 J   ALTER TABLE ONLY ceragen.admin_invoice DROP CONSTRAINT fk_invoice_client;
       ceragen          postgres    false    290    219    3540            R           2606    27717     admin_invoice fk_invoice_patient    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_invoice
    ADD CONSTRAINT fk_invoice_patient FOREIGN KEY (inv_patient_id) REFERENCES ceragen.admin_patient(pat_id) ON UPDATE RESTRICT ON DELETE SET NULL;
 K   ALTER TABLE ONLY ceragen.admin_invoice DROP CONSTRAINT fk_invoice_patient;
       ceragen          postgres    false    3606    276    290            ?           2606    27252 !   admin_medical_staff fk_med_person    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_medical_staff
    ADD CONSTRAINT fk_med_person FOREIGN KEY (med_person_id) REFERENCES ceragen.admin_person(per_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 L   ALTER TABLE ONLY ceragen.admin_medical_staff DROP CONSTRAINT fk_med_person;
       ceragen          uceragen    false    3540    246    219            @           2606    27257    admin_medical_staff fk_med_type    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_medical_staff
    ADD CONSTRAINT fk_med_type FOREIGN KEY (med_type_id) REFERENCES ceragen.admin_medic_person_type(mpt_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 J   ALTER TABLE ONLY ceragen.admin_medical_staff DROP CONSTRAINT fk_med_type;
       ceragen          uceragen    false    244    3568    246            6           2606    27109    segu_menu fk_menu_parent    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_menu
    ADD CONSTRAINT fk_menu_parent FOREIGN KEY (menu_parent_id) REFERENCES ceragen.segu_menu(menu_id);
 C   ALTER TABLE ONLY ceragen.segu_menu DROP CONSTRAINT fk_menu_parent;
       ceragen          uceragen    false    3550    229    229            O           2606    27649 $   clinic_patient_allergy fk_pa_allergy    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_patient_allergy
    ADD CONSTRAINT fk_pa_allergy FOREIGN KEY (pa_allergy_id) REFERENCES ceragen.clinic_allergy_catalog(al_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 O   ALTER TABLE ONLY ceragen.clinic_patient_allergy DROP CONSTRAINT fk_pa_allergy;
       ceragen          uceragen    false    288    3616    286            P           2606    27644 $   clinic_patient_allergy fk_pa_patient    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_patient_allergy
    ADD CONSTRAINT fk_pa_patient FOREIGN KEY (pa_patient_id) REFERENCES ceragen.admin_patient(pat_id) ON UPDATE RESTRICT ON DELETE CASCADE;
 O   ALTER TABLE ONLY ceragen.clinic_patient_allergy DROP CONSTRAINT fk_pa_patient;
       ceragen          uceragen    false    276    288    3606            I           2606    27530    admin_patient fk_patient_client    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_patient
    ADD CONSTRAINT fk_patient_client FOREIGN KEY (pat_client_id) REFERENCES ceragen.admin_client(cli_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 J   ALTER TABLE ONLY ceragen.admin_patient DROP CONSTRAINT fk_patient_client;
       ceragen          uceragen    false    276    260    3586            J           2606    27525    admin_patient fk_patient_person    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_patient
    ADD CONSTRAINT fk_patient_person FOREIGN KEY (pat_person_id) REFERENCES ceragen.admin_person(per_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 J   ALTER TABLE ONLY ceragen.admin_patient DROP CONSTRAINT fk_patient_person;
       ceragen          uceragen    false    219    276    3540            B           2606    27295    admin_expense fk_payment_method    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_expense
    ADD CONSTRAINT fk_payment_method FOREIGN KEY (exp_payment_method_id) REFERENCES ceragen.admin_payment_method(pme_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 J   ALTER TABLE ONLY ceragen.admin_expense DROP CONSTRAINT fk_payment_method;
       ceragen          uceragen    false    3572    252    248            M           2606    27620 $   clinic_patient_disease fk_pd_disease    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_patient_disease
    ADD CONSTRAINT fk_pd_disease FOREIGN KEY (pd_disease_id) REFERENCES ceragen.clinic_disease_catalog(dis_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 O   ALTER TABLE ONLY ceragen.clinic_patient_disease DROP CONSTRAINT fk_pd_disease;
       ceragen          uceragen    false    282    284    3612            N           2606    27615 $   clinic_patient_disease fk_pd_patient    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_patient_disease
    ADD CONSTRAINT fk_pd_patient FOREIGN KEY (pd_patient_id) REFERENCES ceragen.admin_patient(pat_id) ON UPDATE RESTRICT ON DELETE CASCADE;
 O   ALTER TABLE ONLY ceragen.clinic_patient_disease DROP CONSTRAINT fk_pd_patient;
       ceragen          uceragen    false    3606    276    284            1           2606    27119    admin_person fk_person_genre    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_person
    ADD CONSTRAINT fk_person_genre FOREIGN KEY (per_genre_id) REFERENCES ceragen.admin_person_genre(id);
 G   ALTER TABLE ONLY ceragen.admin_person DROP CONSTRAINT fk_person_genre;
       ceragen          uceragen    false    3542    220    219            2           2606    27124 %   admin_person fk_person_marital_status    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_person
    ADD CONSTRAINT fk_person_marital_status FOREIGN KEY (per_marital_status_id) REFERENCES ceragen.admin_marital_status(id);
 P   ALTER TABLE ONLY ceragen.admin_person DROP CONSTRAINT fk_person_marital_status;
       ceragen          uceragen    false    215    3534    219            D           2606    27351 ,   admin_product_promotion fk_promotion_product    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_product_promotion
    ADD CONSTRAINT fk_promotion_product FOREIGN KEY (ppr_product_id) REFERENCES ceragen.admin_product(pro_id) ON UPDATE RESTRICT ON DELETE CASCADE;
 W   ALTER TABLE ONLY ceragen.admin_product_promotion DROP CONSTRAINT fk_promotion_product;
       ceragen          uceragen    false    256    258    3580            Y           2606    27907 %   clinic_session_control fk_ses_invoice    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_session_control
    ADD CONSTRAINT fk_ses_invoice FOREIGN KEY (sec_inv_id) REFERENCES ceragen.admin_invoice(inv_id) ON UPDATE RESTRICT ON DELETE CASCADE;
 P   ALTER TABLE ONLY ceragen.clinic_session_control DROP CONSTRAINT fk_ses_invoice;
       ceragen          postgres    false    300    290    3622            Z           2606    27922 +   clinic_session_control fk_ses_medical_staff    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_session_control
    ADD CONSTRAINT fk_ses_medical_staff FOREIGN KEY (sec_med_staff_id) REFERENCES ceragen.admin_medical_staff(med_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 V   ALTER TABLE ONLY ceragen.clinic_session_control DROP CONSTRAINT fk_ses_medical_staff;
       ceragen          postgres    false    300    246    3570            [           2606    27912 %   clinic_session_control fk_ses_product    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_session_control
    ADD CONSTRAINT fk_ses_product FOREIGN KEY (sec_pro_id) REFERENCES ceragen.admin_product(pro_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 P   ALTER TABLE ONLY ceragen.clinic_session_control DROP CONSTRAINT fk_ses_product;
       ceragen          postgres    false    3580    256    300            \           2606    27917 *   clinic_session_control fk_ses_therapy_type    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.clinic_session_control
    ADD CONSTRAINT fk_ses_therapy_type FOREIGN KEY (sec_typ_id) REFERENCES ceragen.admin_therapy_type(tht_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 U   ALTER TABLE ONLY ceragen.clinic_session_control DROP CONSTRAINT fk_ses_therapy_type;
       ceragen          postgres    false    300    3578    254            C           2606    27334    admin_product fk_therapy_type    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.admin_product
    ADD CONSTRAINT fk_therapy_type FOREIGN KEY (pro_therapy_type_id) REFERENCES ceragen.admin_therapy_type(tht_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 H   ALTER TABLE ONLY ceragen.admin_product DROP CONSTRAINT fk_therapy_type;
       ceragen          uceragen    false    256    254    3578            :           2606    27134    segu_user fk_user_person    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_user
    ADD CONSTRAINT fk_user_person FOREIGN KEY (user_person_id) REFERENCES ceragen.admin_person(per_id);
 C   ALTER TABLE ONLY ceragen.segu_user DROP CONSTRAINT fk_user_person;
       ceragen          uceragen    false    219    3540    237            5           2606    27184 &   segu_login segu_login_slo_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_login
    ADD CONSTRAINT segu_login_slo_user_id_fkey FOREIGN KEY (slo_user_id) REFERENCES ceragen.segu_user(user_id);
 Q   ALTER TABLE ONLY ceragen.segu_login DROP CONSTRAINT segu_login_slo_user_id_fkey;
       ceragen          uceragen    false    227    3558    237            7           2606    27189 '   segu_menu segu_menu_menu_module_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_menu
    ADD CONSTRAINT segu_menu_menu_module_id_fkey FOREIGN KEY (menu_module_id) REFERENCES ceragen.segu_module(mod_id);
 R   ALTER TABLE ONLY ceragen.segu_menu DROP CONSTRAINT segu_menu_menu_module_id_fkey;
       ceragen          uceragen    false    3554    229    233            8           2606    27194 +   segu_menu_rol segu_menu_rol_mr_menu_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_menu_rol
    ADD CONSTRAINT segu_menu_rol_mr_menu_id_fkey FOREIGN KEY (mr_menu_id) REFERENCES ceragen.segu_menu(menu_id);
 V   ALTER TABLE ONLY ceragen.segu_menu_rol DROP CONSTRAINT segu_menu_rol_mr_menu_id_fkey;
       ceragen          uceragen    false    3550    229    231            9           2606    27199 *   segu_menu_rol segu_menu_rol_mr_rol_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_menu_rol
    ADD CONSTRAINT segu_menu_rol_mr_rol_id_fkey FOREIGN KEY (mr_rol_id) REFERENCES ceragen.segu_rol(rol_id);
 U   ALTER TABLE ONLY ceragen.segu_menu_rol DROP CONSTRAINT segu_menu_rol_mr_rol_id_fkey;
       ceragen          uceragen    false    235    3556    231            ;           2606    27204 J   segu_user_notification segu_user_notification_sun_user_destination_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_user_notification
    ADD CONSTRAINT segu_user_notification_sun_user_destination_id_fkey FOREIGN KEY (sun_user_destination_id) REFERENCES ceragen.segu_user(user_id);
 u   ALTER TABLE ONLY ceragen.segu_user_notification DROP CONSTRAINT segu_user_notification_sun_user_destination_id_fkey;
       ceragen          uceragen    false    3558    237    238            <           2606    27209 E   segu_user_notification segu_user_notification_sun_user_source_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_user_notification
    ADD CONSTRAINT segu_user_notification_sun_user_source_id_fkey FOREIGN KEY (sun_user_source_id) REFERENCES ceragen.segu_user(user_id);
 p   ALTER TABLE ONLY ceragen.segu_user_notification DROP CONSTRAINT segu_user_notification_sun_user_source_id_fkey;
       ceragen          uceragen    false    238    237    3558            =           2606    27224 '   segu_user_rol segu_user_rol_id_rol_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_user_rol
    ADD CONSTRAINT segu_user_rol_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES ceragen.segu_rol(rol_id);
 R   ALTER TABLE ONLY ceragen.segu_user_rol DROP CONSTRAINT segu_user_rol_id_rol_fkey;
       ceragen          uceragen    false    235    3556    240            >           2606    27229 (   segu_user_rol segu_user_rol_id_user_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY ceragen.segu_user_rol
    ADD CONSTRAINT segu_user_rol_id_user_fkey FOREIGN KEY (id_user) REFERENCES ceragen.segu_user(user_id);
 S   ALTER TABLE ONLY ceragen.segu_user_rol DROP CONSTRAINT segu_user_rol_id_user_fkey;
       ceragen          uceragen    false    3558    237    240            F           2606    27392 "   clinic_disease_catalog fk_dis_type    FK CONSTRAINT     �   ALTER TABLE ONLY public.clinic_disease_catalog
    ADD CONSTRAINT fk_dis_type FOREIGN KEY (dis_type_id) REFERENCES public.clinic_disease_type(dst_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 L   ALTER TABLE ONLY public.clinic_disease_catalog DROP CONSTRAINT fk_dis_type;
       public          postgres    false    264    3588    262            H           2606    27477 $   clinic_patient_allergy fk_pa_allergy    FK CONSTRAINT     �   ALTER TABLE ONLY public.clinic_patient_allergy
    ADD CONSTRAINT fk_pa_allergy FOREIGN KEY (pa_allergy_id) REFERENCES public.clinic_allergy_catalog(al_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public.clinic_patient_allergy DROP CONSTRAINT fk_pa_allergy;
       public          postgres    false    3594    270    268            G           2606    27448 $   clinic_patient_disease fk_pd_disease    FK CONSTRAINT     �   ALTER TABLE ONLY public.clinic_patient_disease
    ADD CONSTRAINT fk_pd_disease FOREIGN KEY (pd_disease_id) REFERENCES public.clinic_disease_catalog(dis_id) ON UPDATE RESTRICT ON DELETE RESTRICT;
 N   ALTER TABLE ONLY public.clinic_patient_disease DROP CONSTRAINT fk_pd_disease;
       public          postgres    false    3590    264    266            1      x������ � �      )      x������ � �      '   [   x�3���������
��;]<��%��)��y�FF��f��f
V`��G\F��������~������
.�
!������ ��"�      O      x������ � �      Q      x������ � �      S      x������ � �      W      x������ � �         �   x���A
�0EדS�	3i���Ŷ�@i��]u#��BW�E��(R���=��!����*������U��D���=#Tq����:M���:�ƿD|��B/Ʉ��%��1���إ��6m��C�YI��4�+7��[��ښ�wv��2}���b�Vm�B���T�      !   y   x�3�t�ss�u��p��t�KK-�M-�W�W��9K8Sr3�8��LuLu����3����8C=���7:�x:�s��&g&�d�$*��)�f�%Vd�j���=... �h-�      #      x������ � �         �   x�m��j�@��ڧ�x���?��CBb��I.���Sߟ�RL:	ͧ�a�.�a����q�~oqYwϯ�o`di1�$�RVq�E>�mx�!�~������GE�Q�9o>�N%�@�0�c}�*��l�,�����r9�C!������o()g�h���
#���{�ˬ�u�ZN@��{I-�VE�'H���P7k����O      A      x������ � �      %   �   x��ͱ�0���+��#�!%aA��˳<L�I������88�{�;���jT���Nt���x$���yb��Ô���:(d��d��%Jy���_Q���ܨ^uu[��v�^�
i�/�d)����m�#��h��=��W+�F���D�         |  x���]r�Fǟǧ�X������1��\BJF�*\�2��(�)�9W.������l�UR���_w��G�)�X�2I\��<-�ۢ���jTO,��~`���zcۯ=����2.JrU֞���ͨ�?��dBK�$ig�v�,�ն{
_.�v���S�9�Ι�L�\�B%�e�lI�-�#�r�δE�	���|�����u��x{e]I���K�G5�V}Km9t���{�5?Ŕ�L�T����9��d9_��,����)䃜v�/��0ôR`�B�����A�[[Z��j�تw��>��$�SC���G��a�>w?�LK���+�	�u�G�;�ݭ+k���f���]l��u7[G�����4������qd�n
K{���~�Zd#ݦM���<L�1�M�G�J4����#�4 ��8[ў�e�PϭjK�^�A�	--u���F��6��a�>�W���2�ɴ[�"q���"ˁ%�����c	��<Rk" ��jtm)��T�Y�4�ҢRG���^a���"�+w靯1�T&�݄eXmò]��E��]t�����r)r�Ds-?E] �dRFi�t؏��pL0Ɉ���hF�+?�����h%p�i�];K�j=�;c猣Q������9C����+1�,F?�����ӌ�Kk�Ϲ���"sα��I>�m��MiγD�L☾q8�q�)OQL�0��Is&�	��|M���ߤ�7��qkL\LP�&ط�ґ����%����	h�=����ߒi�l�����(�L��$�ˊC�H,�+2(
<W,j�4���>�!��)6�+�ma2b��+-��j7��U�~��L(À��}�Oa�N��W�4�\qc����br��8���=ķK�Srvv�/�r�]      	   l   x���9
�0 ��+�@�n����x�`��|��G��J�rfb���4�4]X�^#k�Q.`O����>�I�u������Z<�#�j��_�P�+8�����QJ�V*'�      -      x������ � �      /      x������ � �      U      x������ � �      +      x������ � �            x���r�J�.�^~
Gu��~�U�����X\�Ʊ"�������0s7Vc��[�q��N��X��]�]5�U1�H��9��cd �����P������~��n���H���S��d�O��Ԟ�.�����o�J'$9��:�R��c۬k��f��a��w��hw������C�k���wv��݁JM^��IG��͕�mu�ɤ�<3&S����U�������t��?9�����Q:0����HT�'@��zho~ɟ�>x�f�������3{�l�"�I@\�0ԔD��?��N�ٟ�������" 	USzB�"P/��
�� 0���=��������Hr���Ӝ�������X?6WC	�i�R��LW�Ry{Ӯ1��昏���~
�4�� HHdt����ϐ���@��������AC�@�He�*x'��;��NxM��;���J�I�����q�q�� l��+��8�a܁}�khu�?�B\)VHK��m�A�� M�����kfO��	���5��?���RǢ�F=����F���;���z�uPo����Z��Vg`M�.����s�ɃeO��G*�Q{�/���͏3�M��N�Ս������m���iu}[X��7GL�Vw���-:l�}�oí��Y�2%$R
�$�d�����Sg�o��^����|����?��J�������YL��luF�:{����|�?R�U�x��'k��sǑ�ZO�����|h�w̲yYh�
�d&��5�d��4���^�I�hܼ����<�5�媤��o0o��;Km�|)��P3_��]i����m�������&��5���
�6��Si��T��˸�.���^_Z�A!���Q:�c�S�:��k2�)��>�Z����3s�/&U؜���^���<��~����)��`RR0T�=���kq��g��Ɠ�.���J0Ф�w�s���m\��wk��3�8�f~)��X�����E��S�?lQ�Z��\���e��\9$ ������h��F�4�J�'y^d�cۙ�
�`r�w����=4;���;Æ���Ld�Ik?L1����?l���M����cs9��E
%L~K�+հ���YN]�8��K#���/;�p<c�Z-��[�"G�X�`K_\�C�h
�$E
D%�����r�:\#�W����Z�\4\�.䁫2`3�3�|Vy�����;cħ��A�Qھ���*�Y�$B��bSݷ���Tr��|���������>���?$�LR��zVQ�#p�G�H������Y��n��RDe�ž~2��>�臟�c��.�����p�Mb@ e�W����FN�rę�eBf�E�G�99$�#�c���P`��7�j5!�: )�,5bD$���d� ���<�q��ǝ �$�Z�¼?�9k���>r�9��E������q�u$OW��<i��qSb��h��Í���7�<����R��M{���П˄~8�̰���?��:p��>zls?��H[i���x۝U)�G�e@`����O(kގ+���1���b��i�����󢤁�.*�},��I]�
�Br�BÃ�69����x�ï�!���r�9��]���_�ȃ��t��ޕ!HO%�B0EpR��J����8?)E�=N"gP��n�$)+�	�BR�qV���������Pi�P]
- H!�c��ʿ��ʿ��$	%��	&��T~�U~Y{����I�ǩ�6ګF��HU%I=���h�����_�x����U������.v
�8��U#�ˮ��u�*�Q�)sՐ�US�]�WWM�먫*I�V��~[9v�$u�̼���� 5��h�3^9h��zV |���;�i�%�u�M�T�b�:�w���0��>����1	x�9� E'f,G���^�rq��B{�ʹ�8E)�_�s�h�f���L�G7�V�>o���D3�[��Ԫ?�&��I��	�D�Py��W`�I��XR��
(�Jx��	�,R�-9m}c���#)\�t�Nس%��
�o@M��ܳm��2�F�' I�3��L��E�E���U,U�U")	�X��K0�Hߠ#�/\�~yB�`���ӟ7'�5����~!Y�`&������"NG?~�?q����(��`�֢ &)u��<v>�i;x��vG����]莟�:��R
���ZН�u�:�$xB�@G���1�ܲF����M�@GU�c�:zĎ�!:��Tev�
t������m���B���*$F��c�9�����
�?%�����^������J��j�w
���Ɵ��W���T���A�|��e�|����}���%	�N����}�#�Ɵ�K�
�$f�=���`�vÿ�`�m��/�wD�U��po6�;�n�!֤�h�T���d
�-p��L"�J@9�k����7���z_��r��I�/|��6v-+;��l��q�G���l��w��Y����'tZl��ڲ��n/`�E�����5��g; ���v7�9��GoN�W�]�c��`�` �l��#�}���C$EQ�~e�9t�e��u�?�.S��5�ZK]U��ϿOv��nl�8���Ӟ)	P- � {hR���kݯ7wRD�+�J�s��.���䅩��aOv۠"�w�u��:sN��K���9G��s����n��/,����h��&_�C.��A�k�Røz���s]�\s�JH��`�s �l�s/���!�9�nJ�
w��9?w���Cd�Q�2:g�}{�^��pI%�0@�P��8<R�������Z��$��
V�ᑄ��z��z�/�Z��R�P�6�NX�NX�j�cY>�%��~',',���P�=��@G�	�߁��@�����2;*H����8�N���e������
�,�e�������/���h��\�{���/�U�h����绪Vx@7��{�^�����*֮*�Cz�y[+�/�&�B��/���*�����K�/<g�J!%p�Y");�)�l�p�8!�}�_�1;C�H 7�!�av^�nF�
����n�C�I"�@���7���G �+bW��$l	#�Ȃ*`(Λ�^�^��1�C���U�o��
Nd��&/h~/}/}��B+̛�g��ܾW�~?�E*�Y������+C�+C���X!2�'�`����{e(+C���DV#Z�`�}�@�}��RBY=Q�����-}(~@���V��*.SB!��6�R�v�?�`b��������?���������)II�;i�(�E"$��/}�����>CŁ,SU9�U~�f��kkP3'Sé��+�gWv���U�ޓx_���N��B��NB��)��׬~�_��Yj��Ui���),�\f����6���.d��)H'��kz�~�,��e	(p��y��-�>4Ju�7����QE>84�D�-NE �ܐ�E�Ǿ��To�r6 n��/jj����V�K��L���U����+�t�!W�g���'IA��{`�c�%p�3�[0��(�#[���(`n ��f�� �.Lf���nʙf�{�Y��glj���ըQǓ��xR��O��E0#%�I���$䢭qv�8Q%� 
�Ii՗JIO��34��;�v(�fW/���F�v
���Rk��r�o�Ds^�*���f��f�$ *:4Hⓣ�ŉ
pÈ�~Zj��!܏�E����YQ���K��}����0F�����r7�S�%Ӿmd�����n�<��T3-�p�[��P 7��r.���v w��^hA'*��*g_$`�f@�ܫ��L�������k�Ü,�ٯ:Q���W�(�3� �1&n���DE�qp7^J�����X�z���Z�1�X��mӸ��o�)z�G�r�e�2��������}���	�4�QR'H��1�Ǳ�Z��X w�s����K{�F�\k��HW*w��8�O�����q`ʗW����g�R���kmu~���:��v̌sIXU\�v�[����xE~<    ���rp<�����
/x8���E�H�V���jG{j���ˬ��[�K���~�Z���$'	A�rp��nW�Up��4�/;`���� n��IV��i��K����S)?��˵�`x?R��K��YA�f�:�
����_ġ$%�;�o�|m�IR��L��p�ŉ*��(
.�!g��Knȵe �fFJڰ������[�����8��j�ʉ�%n������C'3�(����D�I��7A�~`T���@���Ɍk��f��B�f�v' �4�|S:�^t����WC���N���,�k9�kq�
�%��[:�C���>
����_��ʃ�̐N�4�e�7ɡ܂f�2��d�F�[����q��"��@!��jq�\�QPLo�{��K9v=H�o�ɨH�f��Q/�)�Z۾��eQ/r�L�݌���U|�BIJF�s�ׂa.��8
��1���R�lV��g��L�i��,�bP,i�Z�Y,�3?�J��rQ��U>s9�x��`_w�0�TGA5׈��s'G�Νdz�,\w�:���ډ�}�dz�y'ߺ��W=m����뫯6�q���I����Z0�|G�7Wf�\D���]��K+{Iǰ۝]^�drV�P�%@���O�c���j���T�|�e�;�$PY��<�^���t�H'Ü1!?�a�e������M��ݠ�k*�ړ���7v�]ʁ�k�@e�-��c9I%Kb�w-�扣a��\h��挍���lK��ԛt���n���]�l|E��<�]�0���*.�3y��J́���DN0?�d��\@?q4���ӖZ��Ŝ09�hA^b^�5K7�=)�X�-H��qƬJ^��ۮfO�`�*t�_:�:�c��N�ʊ_<���݂a.��8�����=z=�<�C~�[���G�������b�Ɨ��F�rGZm�X�����Y�/�\�~�D�*_o���sőP�ygu�0�s�`����j�~N����8�%�8s~���_�OK�-�[.��e"t��c0秶S���$ �_ ����j�00P	]h���=>y1_9;p�-��y3c�3����u=/��uA�TE��y�6�蝏�g�c8ǔ�$2�~,��nq����HX(���@[y�y�1��*О?�&f�Ь�#dT{E�vT{&���Ѯ��W��骜���!1g�T�\�p����x?#�IBf%��&$�y��I,Qꍚ�\��-�*J"��xT�y�I
&FOJc�?�Z~99�<�z#K������)�*��z�m��F!l��Q�ߣ�;��d�X�
Pm�@�Q	e�`��{)f�q���yAA���mW/��\c��5���)$,�Լ����]�<,�`m'
�/��@h��^@II$���1��uյ��誛V7��V��9
�s�sY�X�RO,ۓ~B~^*�K|1���v�b�$�U��t��]�JI$��þ(�<s�5)0p���β�����{�×�y���z �Ke����|�H}��%1�ބ�1����j��0R	#�x/�ռ��̆$�}��i:�MM1��}��OuC�?�/_��6C�˖6
��B� ��/�NR�7-n��^@KI$����uo��� ����V�/�R�Ȟ�p�a�39cQ�Y�=\�[�'�*T�Oѹ1��:30*7�����|IHa7P�x7%�pS��fU��$pFmi�B#S�nkW��Ӧ}��������O�`	3�RF�<_�aXn���� �TeH ��݂/ �$�ʀ����ȀL�@��z1N��r�E��J7+���������x���|+�Y��_G���#�}C�a���n�0T	A���`��.����MܗZ���>��`Y����uih�:��yS��v�p�P�����(��,����^� ,�F�RW�%:4�-�^��-+�l�|���#�Η�7����夐n1�_�Z=�jVza�^>Լ#�_�6����^����HX*^[�r��#�!�����fe:!��L���t�z�93�j�;�������o訐�_�bNx<���w�n����\@Ri$$u��Ӈ��ܑ_�=/���3qaQ[���\]�h����-{���(��D��Gvd\�W�TFA1�3�)���Ci�^@Ri$$��_���E9�6��}��\����⾭WJ�7��_�񤵪%�x����<�>���x^��d �Ee �k���T	Me�7�v{�lN}�P`�7����o�{ޅ���ܺ+f�A+�-��V�O�
�U9:���.���J�$�%��'�ڂ/�4�ʀo��U������&��Vo�(><�;F���/z�T��+���X�÷�Q˰��ͫ���8�E@I���(���޳��p�=�����W���o\�,�s�`��5v�o�{���#WD#�yc2�m�8�xDu��C���=������jÃ���7��ڗ�}��xd,<�T!{x�����v��u�w�������6����n�wQ���Կ��;�-ޱ8�n���V��m ��$�n�f4�81s����ǉ�9<����4���Zfd^�?w@��0~h�ك��z�{Y-��|�סT*a��T�	#laߵ`�;@��K��ξ6��/K�>l;�3�?6��}�0�u'������lq����()
���d���[`j�1�uxj,���i�]7|7����	����m��WH��wB� ��ⴽH�ss�h����}��Y����������n����;�u�|<o��59�:Л�����+����l�
%����2L�%��#��@���=������}��yao�ï�^r��TT�u���1o���p��}��c�Cx�#�P"���3	�>��N�傍�����ok�غI�~yZ���׿�~�/�`�=����Yۨ���f�O.����cj�Dj�j�������U��V�(�5S�*��&�Q+ٟ�8�1xL��)i���P�@���Ѫ[3�M�f�b��'L/�K��e ��A�g����ks�(�}�� �	��������E-�ǴL��H#I��ͫ�F�]#��1{��i�y�=��j)���']�w���t����A��)
MYIB�$�m�2�ES���(w����n���>��D0�`^��G�R�a'[�"(��u�U2�9�$�P��ׯ�IF��*���߃?}��@�^qc:&J��$Mٙ��a^Oq��0w��>���YC�rMzo�ve�X���ب���T�=t.A�7(�qt��:U[�w-N ���08fn��P��fW*��s�Qߡ��x_���K��s����%�Є���o�����"^;,#�ȾK$�w�?��xҁ*�c� ȩ�#������4�_(����4z�̻U���*���u~5������)�������%���:1P�;-S$��[oaߵ`�2���6��ݏ�a+���T>�g�<��=� ���P<[��v��G��s�u'g/���V ?q<�aR%o���1�P�2=L�u`w�`��刪6��v��#���
��x��t�h���f�NM��ɢ��������^�K�}���E��z+���Py`�(P��]-N�'���x�ML��w9r�����]���]�'m�7�����@�8��8܀��w�!;�A�'�8g����ٓFz���W&�HvfO�����p�񓯜�y%o�dCd1��8�YfX�|]�]2�X�_$��'_mM�ya���̆�o��:��TO�)��G/��O����"��rD�h��4�Bd����ie:+T���e��|ԮM��X��n�'Fg�d��4�DWX�38UI�ʇ%�;�7N �������'p��'L���E�S�f����|M��z�^J_�*z�Ng�wR}fvf�m#�^з�/'��ұ�0���rDEh��J~�w���ϋËѬ`�����4��_.��X�hj�v*OU�27.δQ{E�%�	O�#b���;�]-�"fQ	����tV��5yxh\g/�j��ѭ��m��l��    իgUy<�eEk�}P����k���*D��U�^�9��4p6ϳ�t-g�>����N�/~��-��5���}����D��7��$?aC��`>�7<���̜�S���o/q''͜���h��ޖQ��He���M0�)��I$(��	���g��x���n��V��̠`)?F�I+TU(zO�4�_�O�h~+䥏C>2�kS�2c/��!)^04}45F��d��$,�@Ԍ����W*f���YK6}#�Q*������j�p����/�|����*��Uj�gRU(�Z�A�a���ݨ���dz��u���0�0��k��^����`=����)�?���O|I�Pk8�'��}G���I�B�o�'K��A���*���N�W�Č�� @��XRA���,:�� 0�Q.��s�k�c�� >�T�*�^[��;H-w�w�,ۙf�C����^�!vf���2�d�8+F��c�]�5��#FFu����m�Bʬâ���r8�R�/�sž��7��Y�8�NL�j [�Ԉ~ׄ�Y���c�6;}��3���_Hㄼ0�1����7�;��[0�����io��c4�o��X%EPf~��_�N�c��O��������Â �;6�@�{)D�aտ���j�YU�ɿ���d�Y�EQݨ���|�63�|\jb�XS���3�u�{R*�GeГʳg�"��B��*?-�=Y�C�	?��q]IQ}6_��j�`Du���m�P��͊�E�X�?��w�����K�hߍ'cp�]������``.GJӌn��_	�2Pf�����M����Z�Ϯ,�Uq���hU<8	z/����0I�n/��$!��p�I�`�B%�l��T:ܭ�oP��2��]��UܼHi�U�^��������Óv�%��˪M�7_��ǌ
rv��)�$�Qq�`��Ԕ���:P�I�/��������P�ad���.�����Oz�\R3�.�-s:�>��M�D�M�Dr�"�}��E+��[0�{�+Q�^t|������j��OO�ӛ����jv^�%�[�^��7w瓢�r]�/���w��g#f���\��ڀ�.�f+Q�^�A�~�-�C���ы�F�a~^̛�9���VQ����{��g	Ek��Y�?r/Z��2�~8��~�/�-��=�����������v������6�ĝ ��AR&J�G��X��Y��n�S�X��xw-}w��e�o�{ ���üC;P'��o��|3/��+�u�ޙ��%�$^p{}]��8�a�qU��*Y�	�����'�ᯖ��cܘ�������p~��Uy��*���T.rS@��Aش̏ʚ)~B e�b��� �Z0"��R�#�W�0�C�r��>bQ�q�C�k���fvg�1)���S��C���@j��$FD�|k�v���A�n��`Mp�����;K�n�q}��qLu�Hu�x�Α7U>�:!�~��R��w'�m��97�v�tF�M�ͩ>HԘ�f��ٯ�gA����IQ�����hM��F��e<��]�1�l�q?�,:9 yw1��6{�ԶNƝ�M;�vډ0�ڎ��`�|���)
��YfQF��n�{��:ׅ��_��)�z7�%)��
>�ݳN�K&���8�FZ�\��}�#�it0"��2B�3`�=��(̳��aL�#�TJ֌�rm��������s���I*��O x�,�0K� ��m۰�z��s��9]&���"�W�p���~TT��������Y\A�QY�*��]4XU�r���
k3S��g����:�Fų��|�U���)Ӽ�fk�_!�Q���T�o��`���V�w?/��]���;z���f�F�t�L����v{�x��j#̗Jd$#��ޘ�Yf"�{7�ۼ̉c���$���F���։@�9�ƍԏ��,��4� ���q7�����n��J~�� $4��"�����b �H��KU0|��
���|�>����� Mʒ1�p�\�:!��ۭ+b<8wR��"�M�h���o������,�7e������7%T[��c���]���"!/D$ѲXD������,V�5H�X7m��1�/�ZI�/��}KV�&:����e�����6"~���ok�T�"�����\P �DT ��-w��T�u^��Q�rr[�]�Q\�\sZK֥Um<_�GE<Ό/ε��`V���$�$�	��2p��]P���s#ѱ�Ea�@gwY&r�@�8!���߂��w�D�������d	ɾ���~�~{��z��M(p�������:XPu����Qޅ˻��#zG�
�������w{�c�F�o�2@�/|���H��_��Q���Wi����;*��ӡ#��(�7�B�Ua����umX�Ь?_Y�j�~m���f#�yZ<&��fYn�y��{ɖF���B���໽�k�`��FT�*�4�t�r��L��'�&��Z�Y\G:�)�	����E�1^`�5s��\�}�#+���h���
��[��Z�@�Mȴ�D��D�ԉ��7��t�Q����0�M'�����Z�T/7Ӫ���Z�p�̖�m;>�ɮ��U�P:��K���k� #���(fm{�c$�Wz�k3��۟]��Os��L�V/�ޯc�FS{�F�m�s��G���/x��!�ާ��6�!֟��l��7#>�I_��kb���i۴������.#��4w���%�IR��_%श80�&��'&��#�DF���U��@jU ��}#%-���0\���MO������K�:s1ZJC��>��$�I_N5��9�b���l��s�l��F��^6�ׂ/ZJ�����kNk�+���s�B�G��Qw�������ڥ�o�I0�����d*����36릶tw���� ��� �X��P���m��V�
��[L��:7��yRT0��$R�,)���
^[ٰ ���@�?��S��e�Z����ٔ���'������kS����y8�|� 	B�o�5����չ�9)�ہ�;8���$��/(�V#��]i�'eG�������ro(�A�.�U/�Zo ��]z1��U��X�����>~��=@�<���SR�^���Z���wU}a � �(k�1U�m�#O�ջA�p��/�g��Y�b��^���Lo�#���<��P��X��xA��Q�諸(�Nb�k8�T��n�V��^�����ͭ����:ϳrV����K-]U��������$�Je�}J�^� �FT����|�����"��jlL�5�T����r�R*�&~��/�3u�X�ˉq'S��芬	x~��� ���Ը[0�Eᘨ�2��'
ƀ�G��K��#�S�ӧ{u"I�J[^��M�0�M�%�3�0~��(QdƼ��Z�@,8�A�je�
�����W�_�/��j����|���H�z!T8���^].��Q�av�^����(D�j�nqB�h��=z�$�D�G���{���#	/є�C,H�W�J�h�%_H��䋫�+����p�Xy}��;�j}6���|^��n�]�Iď ~���|q"�H�-���5����C�W���:��y���*����l4L_�\5~�̸g�߄,%�QR�������'��6���M�L4M@,
 )���K��`�5������U�Noe�ԛ�J�Ǘ�b����De�0f��H�pV�-�7F)~|��l�_/3���Uy��b���l]�P�^�O�hI ��;����@u�ٻ��$̷,��_�B�=:��k����I���&;s����^a��@�#I,QB���{�u;�d�$�,�h?��H��Z�GBD�����H�pG�	!�=<`���8w�=<B�-�z�1�z:bLBT=�2&��'���#pGtZ4U=�
Obw�F�8D�S(c"�zB�UOn���z"D�D1q�;D�3L�*�8�w��w�g����>(f��a"��vS�D1c��~7�*��n*b�(f��g��"V��Y���2���J3Vy��2�v�X%��<    bL�a��4Ɲ������m>�},	�|��R�g�KI��hʪ�)`�+b�����ᎈ�SC�1c�G����PF*b�8f��%!QC�1c�G����Y��q�z��GB0�0N�,b�8f��v�`�a��,b�8f=8�DB0�P�D��q������x&����1��`6�h�W1t3�~�v��E��|�J�4�e�E��ČUO�4��e�$1c�G���U�"VIb�*�i��U*"VI�Y���=���3D����6K��F��ǟ�F���忝,��<�����L�M�k����
�f`�k��Zc��q:g-�]��_¿�(E�$  ʈ���>O���;����`>�C��L�f��x�������N���ON�f��?;S��d�{�)��u����S�Lͱs�2�o������ۼd��8�` ��ԤLTʏW�8��"R�)��i�D�mk0�g�Y\Z?���rľ5Gsn���C��;Ҷ�S���J������R� ),��򄔗dSL$~���[���I���� O���I��L�8�8��8�Dq�q������ٟ�Z��t�|���Υ�?w�.��y!��d>�����Q�~|&�*���]E�Ab�q�9���L�A���A�cE�%=�����o���zlϫtp���O��y�8ɓ�dvʤ�#����L��_�@�I��S�U�Nb'V{#Rv����(��z���������=5m���59]I���	�����j��5��\-@-�q҂W��{��C�=�_ܗ�>f_v͕�h��{�ضK���,O,��OyN����ce���Y�pc��ٔ���C�[�ӎ�~������~���L'��w�g��^�%׀�e����W����,��"�0QLc���{f`�;�{����sy��asi�&��=����c?x�yTym­��0{��;S�f�`r4���͸9������]76�c�٧O�A�4��t�	����L,��̲�?�K���壙1gre��Cn"��_�����<&�����`����ߞ0���}���ߣS&FG�]�q�1S�O7��+�i����:�ؙ:�p��n��`�7����{����44��ƣ�:{��yV�s�sA4�4�*h���G�̘��|6�N���l6ML��6`
��wX��q�̺D�;�<�S}�67�;��������yim.��Ž66a���o-��Qw$;���b�� W��ܙ�g]g!�)�yk6${�Q0>UTA��)@�Rc��,.�L�������<9m�M~��5Xs�#��Lm���փ�$��7�2?��D�֓��`N�3��suA�ñ
�9����ݻW���o:3ݳ!c�LG,�ӣ+S���-�N�+`�z��=�'K_�ñ
޹�rÙ���0����������Do���e��/6k�4������^_����%��!YU��1�mp��И�����z��_��{����z6߳ڧL6���Nf�ӑ����>W�;��>��w�^W��f�Fӗ)��v���}z6�W#�ôN�����]�������-�o�}�k��o��� ؇c�뚎��������V�l��:�p������WKT��1�m%j3�����<�n:��u�֚:�vb�{���Z�
�m$��6&ҩm�gKG2��î���a��/�c�'�uv�kz��mv��c݂��iL�5���1�ΆNPܙ����k�?���^3���i�z�e/���ӶqjMmk�?7����P0'���}�,�����r�<��U2#P�2[n��"ۖ��C/̰������I���S\-7�������f����aaA1��cl�O������ri�r��^���W{��פ�Ɋ ��8ծ��. r�8����l�
p_�rB�lRg�2�8]��/-�L�#snؓ�^E� tFb:�����n{l�����3}�]�aS�Gc�v��������NvpK>�A|-f�X�.��\u��HLcn��C'D.2{���6i6�,>�|I}�1�N��԰x
37�Nv���<?|�Og����!In#1���΀��u�*Oc���U�9���Zm�0��u�Sw�l��u�霪]cO�>Wނ��S��J5�κw�\���kb�Yk0������L��v-������[a}���5�ؚ��:b��#c���g�/�O�D�L��Q�پ엎����l�Nn��}�m�����O~�a7Ӱ�Vڢy�����p:ݑ���7x-��`��g\���f�s�3�o�j�xq8�8�7㼄��i�Ilk�n��V���}?��[������������5�10�y�Sc�o<8���Z!��ј���޸�������Y�fn'.�M��i�1����_[��y������*�����v4Na���~6�}��s*��������2 ���8���.P�������ng'���Nf��6�6�j�������=ᮚ��l[��͟�φ� (Gc�����ͱ�=u��]�_#e/�u���b^��FN�u/�ٕϙܜ��/��Ͷi�r�:~�����S���&���AL��)&��oo���yum^y��;�����I{�u�*�ɔ�m}��]�懥O�
�O� $Gc�{��g���r�וh��m2ek��3-<�y}M�6��Cg_Agr�\�br4N19Q��qRg4n�;��/���Cm��߲��ۍ,�y��ݵN��8~�#`�Wxc�� ��p�&p�{Zv�bJ�$IB�$���)a���=���_�_$��/��gs�U������]8¡��.���lo9�:u>t��?�|�/��9���0�ٿ�[��� 94�{������lI�mC.���"��������k��MR�J
�d{�#-������ĹM��mÎ5cn�ӿ|�qr~��r0����A3���1���-g}�ٻ�i��t)��T���u�n1"6}hu׸e[��g��� �HTQ��*Zۜ�G��X�T�H)�&)�!W%���U�ѫ�f�g��o�J7�@������ ��ޡK4EP��P�e�L��7�$G�L��d�7T�k�k��duzm̍���R Jˊ�ޣRj
���(�*S������G���qZz���n`u�������c��on(�gJ�ֹ2�'���������@g�y��C���0�sZ�&I,�$�J�Lg,�J�7fu?Q�e��,��T�D J����t����	r�F!H� �@������w�E)3Z�Ęy=��ڏm�����lk�����'��?JH�R�E��I���Z�{�"h��M�RáE���h��=�B���Lw�����ny��e,��l�g�����k����3��W�z�^��+�[��m7�ﰩimcM�+� �N�T������|q������������y�����>_\a^�}�n�;�������&�Q���7j>LIr
KIYU1J�%��jDPR(Q|�tN]�J�J#(IDP*�P�A)G��%��0(���#(QDP(�AI#��C��ʈ�J�.�#,#r,���Ĉ��&�1"<8��G@x@����`�1�<8�i\@y@�8��>b�1"=8"��H��!RDX
X��! ,��^m������(1�<4F�W�$JH�0)O�!I*��Ho�13ݮ2���� Yx"`0F�D!$�Ք��l)`0F�F5[
�����̖�����Ec��]��Q�
����E���]���I�*0F�*4���#ރ#ZU�ރ��{"�ǩ�������4���ރb�{pD��
x��*g�
x��*iG�#�U֎,�=(F�'��Y�{P�xOTY;����8��Y�{p�xOTY;����񞨲vd��q�=��dQ�L�xOT>����񞨲vd��1�=e� E�{p�x��'R�ǈ�D�O�x��*�H�#�U>�"�=$F�'�|"E�{H�xOT�D�������!1    �=Q�)��b�{��'R��Ĉ�D�O�
x��*�H�#�U>�*�=$N�'�y\�#�U>�*�=4F�'T>���s`
���	�P
L�1b>�i����Q��4S�}h��O�\�P`��M��	��L,	���	��
L��1�?���B�)�?4F�'T�[(0H�
��
L��Ā�D�C�)`@r�Pd����qb@a�¡�0 9N(2�H���1�PYo��0 9F(T�[0�h��1�Pyo��0 9F(T�[(0H�
��
LRbĀB���S���1�P�o��0 %F(T�[(0H�
��
LRbĀB���S���1�P�o��0 %F(T\0��)1b@�2�B�):>'F(T
\(0H��j6��ƈ�J����1b@Q�a(`@j�PT�F�S�76�?v�?���C�JM^��IGD7W���X�e�������t���7TSPNB"Q	3��n5^p�`���p�0p�N8&Fp�`���p�'{{�"�A��F�p��q��m�nY7����D�*�{m�"���#���{m�*���`�-{��Nc�)lt�M�w�#({/�n ����#���;����G������M���v�"VIc�*����2�1�J3Vy�v�`�ah�*b�r�X�c�U��n��c�*��[	�*CM�"V)�J7�!Xe��R�*嘱�#p�`��l��U�1c���[��UR�o�wG�rǇ�C���k�c�;w��1���J��u�KR$6c���������uOL� �v�I�6�~-�w0����*���3�|D�BP��D�Y�u&J�b����:�1��G&��9�ŔD�Y�u>bLBP�� �D�Y���n�CP�P�[D���Q�#�;�L%uVbF�����:�2&"�|Sg7�!�s(����v�[��lvg��4�a����{=�������-��:9h�����	�|���M��l��7������6�熭���$ɶ�P_l�pЊH��z��	I!)��YR�н��l���N�:!tN��n�)��"����K�m�U���Q��Q��i���2G!d.�_y��d�e���O����V�=�{�5ldNb$�m�{�����oe�ü�ޠ���*���`��:Jbz\� G��{c?�+1�z�u�`F��ڞȽ���������·ۏ�M��w��ZO���j,/���l^�(��IatM:�-<��n��j�57�f�1��ǆ���+�Q��7�7��e�^})�Km�bv�J�ΐ<�o����`�6ٍj�C,--�~*�a��p&= i5z�����5�2�x�gm�Ǧ�;!�o��t�h=�:���mo�f�db��I I�/M��mczoO[k42:۵f�b6M��PR����4:�`��]�#�=�*����sT��^)ײUUuK��sT�T3�5@)7�9��y��/ϛ���LBI ������IE
��8���\���@'�ǧC��yX��n�������,	܌�gW�R�2;�ܴTi�kW�����smY�r�y憚T�e����@��^x)�L�^ ����o f�p��$FR�U0���i
ͻ�4�ƣ���?P�=ȯ��yM�/�������J)�����5�ԃ�����'a߀�cڋ�B{�/� +3�(��ª��C��J(ߩ�g/��u>���u&�J���R�IP�P%IY�ܾ+W(%1�0R����`�#�4"�/Z���,��� Ss��3/���P/���r3>ˠ�E�!={�
�n9S�J�+��aM�>�Zc�U�Ģ0̓�͈�V�fx"�q,B\��>C�q�"~�\�)�Q^-_N�N6����%�/����,=�H�I�d{�Fd�.�pfdT��O߄���03�IT�c�|:w�<!�D����c��Ǧ��w!��#Ki]䕲HԬ��؟ë�������sŁ���
W���{ �(�LDȻ[0��=����󿐮�M�|[��?�s�f|H�d�A�ٝB�'J��C�U�RU��� �`�m�m���B�3�qJ"I�$�R?��D��8
y9ޮ���c'��(;f��+8;^gS�W���� Q0�MY�	 ( , ,��N���� �P ���������ؿ�B��� �z\ �\E&�
� շ�E�(
�@%)���D ���TQ��ބ%��d���F��7>rA>������y��cdƩo�P����	��F.��R�V,��#�{zl�R+�mu��7rz_�##�A��J(?q�!22Í\P������Gz?�c#�ɨo+,�đ�.X96rAŊ���OyT�]��o�D�đGe�e�����Ot�"��"�m�Y�8�hl;��`�Kja9�=�_J��',��,�
R)p�=�VVWZ�Bk����sf�ўg/w��q�6'M�=毚ç��r
���I����.*_tAR
�$UU�҃�����	&h_�<�ev7!#�����c�b����N�����Ja��%H%E�A��2�������}�wHS>&���$�%���i���]�k�Vw6`��=]Յ���C�#��`=kM����58kxGk��AL�};�H�0���J�Ʋ�;X'��cU
\'��:��`�tt4!��ɴ�����R��P�O��LzX�%®V}�:!毤�i�   �co��C^�:�d{G�|G*�*,�8�H7����U�>�]i�FG�p _.[wWFGR���p~>'zfI�#��N�7"�4�aH��?��y��8�&�Tﳿ�C��M�!߼:'W�rᎶ�F�ٰ�h�o�S2�����(>_W/:gg����;s�*ϲ# )!����`��V�A4�O�Y����?6`9��,�j��W��usXmWch��e�95[u5��(+�ƅ��!� 耦$%�����B!�݂�.Z�d>��P����Ҫ�L7k�s7�b�Hϳ���Y�������Hק�0��?leK�/M7s@G4EpAf�}-�k�@���h2�J���-L��_Z����h�&.的g>�3��}���Z��c�֛������U�K�g�骞Y�/[��b?{ ��دen�o��d�Þ���&�c_�Ϋ{r8�{AJ�.�4����m]��2-��o���n���,V�r+�/[��mcP�ך���'�2� ŦdL7�c/��{QJ1�&��a�����	kf��y���	�t��@��i�Ƽ0���]�Z|Y�S��|X�������3O&1sU�Ä�5�tQB1�&����-|򸑖�|���j4�J���25zq�����Q�I�b�3�k�V>��p���kl���*���������8��
�k�j��WE�G���g\��~Y
~�K��$�dV��B�Ne[�3��#�^<���CC.ݿ|=�Pf)IU�`����	Ź ���>j����z~�c����o5��ܾH�U����ꃲ�4��g�={�_����t0l��׃� _��d$��w�`���+���2�}�8��u���v��δ�*-�:�v�f���2�z=]������1��,��+枡�<GE����^��S+�;֩?%V����X�`�Z�ޱN�)#��j�3��ԟ2�����`�Z�ޱN�)#�Nn�ujEz�:u4#?��_��d��\�N�H�X�����ٯ>���Ԋ�u�OydN�N�H�X����G��F.X�V�w�S��#��U7E��U�����;��ȇ_���V4��F�o�fvg��������9��5V�FD�|��ӻ����ܫ�x��߉��P8���]�ccEyaD�H|����À���A��~��yye�zX{Yf�U9q>n�vԗ~�V�����4�o�����_!BXJA�(2��ȟ��[0�E�^�r��\��������_I�Y��J�P����O�l,j�fY�M�˫^^N�e�����I���e��|Q�F��T�a�%����̵2��Z�ӋIӲ���Gd>��R�G����u� ڲq���/)=H5)1-��,��wQ    �F���x�Y�f�
>k�>6G���$ѓ�n�D9'�+sXn%jh��Vn����>�V����Ϸ9�Y�V  � ��nqB�(��Z\j,ʇ�2욆�e�Ϟ�����dP�V��҉I�V<�?�Z,Ȣm������O����R�� a��݂�/�9F���Xi��~mq�Ap�m��$h?4���~�:��d��v�d�us|^K_@�*�{����&�𵌤	R�_�6�ZgjH��O��+?�/���I/[u���L޾�i���}1��s8��P=����}^��w�r�Y�>�O>|9�^K*�6�/��|Q��j������M�c�V�3�R�6x�J��m_���m�d�=4z�(��r���x�jE��]��X�1�!�L�����-���:�*Ϸ48 ���ࡧ�rv@� ��F~�ꝛ���T���i���3�٭���R�೺�K;e�9O@���"*n��`��Z0�E�
E�´�/�>�N9W%�yz���V�0Ϳ��I3{�ȁt\���ef<7�3���V��Jt�z��8�f����1�{-�"j�"b�����gt��Ի���Y��Hj�
�ZU�\���`R��L�4/�+���h��~v�)�d���Հ�.�T(">�*@�pB���	'�@�Y�~�V�/��&�f���YSih����ִ��pІT;+4Bo����<ޤR�_�uW�(}E�dWs�28����a��볖VJ/����ͧL~�����v��a>��;�G^��h�Rv�S~�U�
|����vuo���;�tɟr>ӗ�����k���ɣw?l����д�QW��}�O�Y��l�QOx���Y:��z�`�4$UQ�<��n�O��ٍ�۵��s��?Jۆk6��N��޵�A�JT�6{���y���Mt|Z�����w(����S+\�K���h{������j۴���ݝ�ͮ1��{t��Ry�踼m��t��3��³�*��芧_�$^Ľ�� R��DT�7A4�>�����\趱��IsZ�蓊���"�V��nt�A��A�ĸ�e��^g�n�>HY>��Ւ`#�ٓah�f���֜�O�#���3{����6z{_l���̞X���Μ���ջ��]��ew��c��"��+I@\���y�DH��M#����^���8�o��aWj��嘩���F�~Ӕ�Ĩ�H�l.�s�����v�L�I�����_��<k�c�[���VF!�D����e��@�^sc��O(�[��P�8���h�g�*�U�k+Z�A-��2�Ar>��ā���ʍm�j���o<��R�V�\_]T���`ۨ�V��a�v���)���IL����p5`��XE5��,_�
7��Ҩ�aw��V���+�IR�PZo.���z2������0�a
�$��Y�����?�y����ا���w���ѐ}E~S�X�/�џo����w�WLջ)�����D�	�jJ��c��ƾL���<���|M;e��N��|)WO�����-.@ɚ�d��6����$?:?~��`��d"� ^5��f'���ZIZ�̺/�O�ZQZd���kJ�Ьe�t���r��4wI�a����C��� ���i��`��d�I�-��/��~���O�R�~�%ct�vc�k\��_r�=�o� ��_��k4Cγ3��C_�I��l�I����d��ׂ�.*�@�$����O�/)�4��_wzRGό䳂����Cv�}��nP-;*j���gw�|&�2�^fV����$�*<�{-N�,��@�d���ڪ��*|��(P��ë��|���/����d5C��Q����nn�Y�l5����X9\_O����O��g�!�k���y�hy�i�`7����/�3O��ǧ��L�v53+.�Jf�,_��2L�͋���$��+7�WS)�ɛpWy:5�13!��·Av�`��Vp$i�@�Ul�����
SQ9x$�DZ��UK:k�'�:j��T
I�	4d�99��Sq1?���{��Fv�]t|�)*z��?a�ѡ�Io�F0���臹�3����b�J�$�(*K�ݛ�C-q�>�ַ�s���_d>���#�ܼq�~x&�s����i��خ�S����v����k%���H�߭!C�ֳ���Fgo�Z�ʎ���-s�iӶT������kM>�í���Ȧ��^6=�h���mh�:�ڨx�v�8J��֚S\��d:a�z�'��~U�v$~Y�������~��^��˸���zZ���@��j���v�ߢ�gHqۖK!Y��o�,�)��CPF�9��[$8�`1��|U�O+��i%ןV�'O�t�J���W��92q�b��r����c82���2|� �� v���L[�Q�����ᴪ5_$c����g�����L8�K����3�]���x���<`�1NEE9�DzZ�3	��>�q���o��{�_�����1��Za}�ѳ�i&\��B�-�D�t�_f��ƗbѸK�}C���L�L���(!�*�V�2�b��xX1�f�P�,���၇��`����J���K��7���m�bx�a��>Xs�
 2MU<��3w� "�T���Ê�]��S��*�V;����၇��`�@d��ti1<�
 2Me�A��pN@d@e�A��p7�f�m�*�Ԅs̐*>̄��8wL�U&t�	�ؚ�L8�V�Ҫ�{�*�ԄsN�U&t�	���U&ti=c�s�	�\j�9��*�Ԃӝ��C��\j�9��C�	�f�}P�ݡ��m8���(j�t�$]�^H���DK R����.E�NQ��*n}���?�<����Sx���������¼�@����b��#a��l�))���_���7	:дAgƹ���q ����
���Bg8�d��#�{��$7�N��	R��V	��2"ȑ����="��o��s�l��=�P�]����H�B��[�����f?l�Zݱr�_���L�"�AJ�Y%8����ؑ�O?Je�5��� �j��3K����BF���Py̄'�V����i,HvH��"r����ڳ�_q�Hpܱ�п|^������|����a���]�&�OÀ��L�H�xj�i�T�OM!�]m��`]����������G�To�z�~@k��n#0+��s!�_yj�ҁX���j����Hp�U)1đ�]�{O3��C�P�n������Ԃ�ĊLVNf�<�ף%���q9@՜s�	�?�7� ��Ԙ���*���U����;�������z��6ƛ���4u?�{a*ݾu��ahT�#S����u<U{���+�4/�4��[�*W�8?��IDb��Rn��a�<��Ӟ��E�1_Ğ}՟�����M���Y!y`��+6@z�I��[��;��h��A�%�8��}p$��2�/TT�N���a\��jZ3��iE�I����Fg�N�}�����٠�+���/�tj[��W�-~U�q*��Ӳ;��G����vf����.��'��2�On�z��o�A%�g��-��՜�w$\Wy5��df>�ห��ĩ8���ނ^�����֍֛��pqL�{P�WF�V>���zb�wB�8��C{���S�
�H4�������gw��8 =�K��8�)I��}�o����nX�G�0]�v����Z<��­M2����=���n�����bM��#z��"�Ὸ���n<I��}�j��Wެ�7�����S<b;�|��՚i�6�a�������g��㈋�;��r0[��0�f?- Js75&�b�FuѠ�P]��S���Q��{j#�m$P��6�A��n�Sa=Z.c#sZ�.��C!�t�.pY�P�{<1�r3�-�Q�g�sx�*�|�ix��)u�"��+D����x�>�����t��p���M��&��@��U�m���/��lT��g����c�W���ֱq�T9[�):g�٫��͹z�z�ќ�7��$\��z�d�Xh��P(�].*�A{<�d4��}�����Q������KI���.�qW:��qF�^����    �-}+���;���m�V���laأ�����|�Z�7���F/�$����T�2��3�KS���]S:�"F(e��,����jȍ!,���e���~�����b�CFo�1毎�������������$�U����P��J˼a���c��`ȏ�N	F�h��V�קf�_�X �R0��4����a���f��[$8���\Z,{Eë1:���
�TDB0��"�C�ji�ȎJ�u������rt�t��["։�%P��C��S�&I��񃆡������$��F{9*�Ἱ�=Ƭ|���L�[H(��W}ABR��5*/`��$8�R$�!p���2�
�n9��ړ=��Hq-�; F��Һ��=�ʤ�G�tA��]�]�(�T��E��N��0�
�=�����h�K��Ap�r�ow�G��X��W@^�������w�� �F~��y�
<p>�x?_U9��Q�i�ܱ%	���=�`b=."T[ْfz�}:�w@��n6��ngV�%�J;���eB+��c�Q�V	���NK�?
>�Jb䎽���^�XC�F'[�i��t:��lc0�]�14�}�ClR�	����qG��jx!S�i�w՝�:D|�^T�>����i���2�N7���&�t���&�
��.�YO`������8��J�����3�:P�i�C~v�)��v��j�]�����ϫ#��&�ޢ��'���m�[�ZV�����+Q��;��*��"�qW�jr�B;Y�[:��Y�����5�$'h����&�/%+yOt
氳n�]o��se:t�p�Aà��ĴJp�U,7uȅ&p���whg���M4�/䊴����EdkNk� �}�8�6�'2�w&x�9�]\x��^���p�Y%8���C.4:hw�q��U���w5?����h#G�Z�����r'T�b�q�x(��vI����{5��&`�3	���F�;�D3�U �тԱu�Fj�q��l�e��%�F�\r`�ݾ�m���|L���ڱz�PӼs	��v�IA3���1Y �gw��;���Cs��ރ�<�ԌE2�㰔n⇍�?�Z��hb�
ŵ}aY��Ŋ�V�ؚ;����� z��sㅿU�H�d��g��X��\�c\��8!�|�Ҧ�˫�f���K�ټW��G�1R�8ug�]\G�i��::BWM��>k�w�H������v3ю�+5���N��/Q�ŝ�5�����p �듿o�������3W}�e�E�H˺�YҖt��K�����H���*)��=z�,��$��g�'ܱ9`�����:
��U�㯺z��\��`��7b;����N�Zif�8��S���hor�p�B�`y�j��jמ�v����C��"� cLjo��_$������{��2�<��{x�}�m�a""���L)?����y��5� ɴ�?����.�������A�����>��RM]N/�Ym��F���/�55����or�,H�a\��˥@51����S8&z�a:��4?����v��Lu����1G�ݛ�2Dx*�X�.G�$DyU�2��R���/��:e�auʾ��	��:e�au�>��ce|TuʐK�9��2eȥeʨc3W�)Cn�4�T]e�*S�]Z�Lwl�Uuʰ[�9U���a��)�N�UF�:eإuʨSUđʄ�.-5K��"�T&v�	���Tvi�Y�Tq�����,�oZr��]j�96q��]ZgVw��0Rpĭ�c3Wpĭ�SF;Vpĥ�cF;Vpĥ�3ڱʀ#n5��2ڱʀ#.5�3ڱʂ#.��9f�c�G\�s�v�*��Ԅ�ΜjPSi;�����$*Bx��!e�7����/�o��W�ƕ���En������i/ 

Q�+��R^��V>l]>쏓���VgY���W7 3���[���|��a++��[��|ǰ��ʇmȇ�?��1Qg}���i�*W>l�[����a�;�}�ncQFGk���~+���<�w���|3�2MC|~��o�Æ�a�w���/x�ܥ$�o��V�R�Τn��
�=� ���NR'w���la�:�),�.󧵦��)'|�EtB�}�]��c�	Q2̑CC>���}?�/y�Z�/�Hp����dp��?�C�9�GI�H��Lk�/惠��5"�E3�Z2�\�7��/�[��c}I|�����Ov~iS�o���+#��I���4~(�}Y���9���.P3Xm�&tej�l~��6�U.r������W���݆]R���w	�E�0�	%+���,q���͏��o/X>F�5J�ur�.��s�r%���+��v&��?85���$P^>z`�'�Š��m�lҞ��h��@�K��f�$k�Zl,������^hP$-W�
���_�͜ʬ���|'�?���% ۊVם�,��j�s�mE`b)7�n3s�HdܮkG�򆿄;�a��C#��&��E��
�fNe֌�y�e�	ܑ=��<�mE��|��c�^(0J��p`��o��}�Kg��oju���cE��?%��aP&��'g?t��fN%��H:hOl��c{b�E��e?��M���Ud1I.}&��`�ۈu��<[-�����I#��C�k �,q��w	�*q�9�4R��̡L�c����b��q�z�� <�|->HTq�2gzֿϴ2��$w�z��� b���B�-~U�0s(g��/)�!࿩����ƠV��I�3<�x�i�n��I���a������\��#�gI7������΋��mv��/�؝L���`�A'�;�ʄ�����@HV�}z|%T�_�Pb�(N&��S��o=��N�̘�E{��3�}����R�l�&�Mf1��i.')�|���kO�H �RC�_����9��E���9�UpK�$X	�L3^g�vԨ�*ȓ4���<��c�-��4/eF��^�v"�E`F4�+, ��_զ�9���k
2h��jձ��F��� S�j�%�жٞ�Q�����z5���Z@�Y�1q��EL��f���t�]u�ey}D���=W����s��J_i��Q�>����p�	�i�3��C�i���lF'�2�9W��KJo�h��_�R�V	���됳��é�}��W��-�~:�C�x?�)6���#�}#���ãf��k�F��?1	������Mk/�"l �䛾U�㯺�y
��)1?���&3?/�=�}����������C��UKx:;�'GOu��O�x1��������u�y1��rO�U�7�T�;�q(�4��H���V�K��q1��Iҿ�G��~_��WhjD���㥯֝�ε����A�xu@����Z%8�+�ᐯ��d.�t�*q�Ij6��jh��,��3�:����-�z�-i��Y�T�fz�:�!�~��N�8blH��L�㯺�N�b��A��Ń"�4\�/��x''�[ÿ"�T�WJ|HM�y�
�dGVo�N�7�^hx�gQ?�(B@Z:��Ip�U��ᔧ!ͣݯ�.��-~�l����&X��6$#�M�DV�U<<
��)��~*OkCw�n^N���g�ݞ�Ip�U�[é��i��r�G��K*75��1}}SԢ	m����yj��<�n��8��p$��ݺ��%"h���w�_u�5���f��c�}�*�4��[v�r����F�{�NF�i`|��k-i��t��%��,�q�$�W�AUiDCDV�U��Hp�UwZé;m� ���q�ʪ#���h6T,�4�"�2��*+T,��* 7�F~׏O3�l�ӑc�Ӽ�[�_+� "���_�q�j[���qx�	N�j�� #�s����|؊���+؇�n6�'��A�\�={+��&�'!$u����n�;<l��aa�;�N�m�&��2tt<$����w\荑/ z�q�1��Wv|�*�C�3Y!P:e���S�e�)GB�[2��E$֍m�1G1Ol�R����Q�5k�G���Fq�X��YZ����\bZ~w�G�l�`"�j,    |Ņ���)�i/|��!I)������1}���H#�$�a�9��U���䆝8�]��Kt���y|�N!P��[%8���Ԝr#dq���r��4��xB�3OW�A��m�xb��8����H��v���9����Z�S̨���g|ť���1�M��^�$�Xm�?J|%�.t���nݎg:+]��|CRϤ�)���<��5ɥ��5_͊�Q��|�_q���S~��^⼇�c�&�}�[K���QX�I�qi�Dԙ��Ҭos����.�cu'�P84�KL�T��3	��J5��	U��{�v������ޙ�^=�F|�HfK��*~�0����Hw_Ǳx����h��!h`)m��Ip��*�9�L�F��nl������,���U�,�1q��c�l@+2���@���7�h��y����E�+�M!�[8�<R�"�J)�D�յHx�eԽXCڵ�I����у3�lk`�__5�9�}Z��1�),sb^�:�Ū����屐%��>9�X��o7���֣�c�@V�˒��o�u�Z
��rۮc���+��Psʛ�:��vo���܎#�ݼ�9��Z~���q�K�p��u	w�v҈��?�q�M�WP, T���I��u��jN98�������ql71�������Lt�jl�O.0Bpت��:X�b�PL����P_jԋ(��4+H?��ah�D�����dCS�.򭙗@ �t�����ʆ���q��.��%����Y�?/�ƵNy�wƟ�7΃�5tu�
f%��-�zt��.��q��K�ۣt3�(���a�;*��q2�BOg�	ɍ��ix�8+$b;9Mj�L����g|)��="F _�E��N��R�b�"��(ؖ<��R�x1v���h�kγ�`"�u�ٗ�?U��bIG�W�-Ս8�NI�G{"�X������ֲ��f�@�^�d�V>\��F��*8H�
��|�88�H�~��u��)�N��+����U����g\)x���	���~��GY��&�N�������z��KY�vb(R�G�����D���s���vԽ�o����.��oJ��)D��[�-�x�y>2f��v�[{���@3��0؞5Qp�mO���fY�#�'�1֠=�����9���<pƙ�~M4�a/i�m����6Z�u`�������Vb%�-x8�l�a�o��sηo�H�q#hCvg�+�	��"g�)��u����-��u�P���Ģ�7�,מm���h]�&�R	G����Ϡ|��.-# ?� eo���_u��\�9�8e��������pXo����R=:�b���˙es4�Ϩf�$�l�C�Xڗ��Ы�4�?�U�����n������
�t5�;Ŕ_w�:oi�&v�]�x4Xд��?�%�>ݯ�,^�4��K��,<wVo���<�5��o�����/y+���_����vd6���ͽGx�n�̥�f����T����$k�s�jJ�%Ρjt�9�g�������6��b2(����`���0:��p>�Qa�^��!I�~��]��䏪k:~��2�9"lU����˟��N�w=�h��J�\G�޲D\�	g����?�끈�(�r����f����&{zl5h�����t��2��e�}�
��h�ۈ�����jX��[$8�J��S���Qz78�w�˸mĢ�}�lLcf���y�(&���cL;Q�ɖsO�:�V$���m�ul���t^�Hp�U~	�C��R2��q��%�#�9�b.�N��xT-�
[2���/��Yؚfi��fE]��|*5$�>�P&�-;�o������)���������7��Z���m�����.�����	�,�=.��1�Bm	����^�\��Agg�N�[%8�*�t�/S�,�ǗU���$�e�h����S}6�y� r�|��n��C��iG1�TB��sQ]�B��� �'�yZ���"t����^jE�N	��JR��/���9���Qn6&���ml��ex��&��� v��O����:_`ґ��Zo{�����FA䁈�%/��1l��T�*�^匀�8B���4��6�?m:��\��*Q���v;}�*��F�3_�8iO+�R?ۯ8���+
O��؋�F{�K������>��8�{:�}K��;K�_T�64E��:@!�/�j_t�t�g6.�h,���<XĀ#�ơ������¤��?a8[u���p�h��M��io��}BH��JHŹ����ٴ�
� E��*^��X���n/������o���f�^�Fjm���_��D<�h^�1�����:����ǰY�;%��30[�ϼ��yō#������Ө�MG����`��&�Y����2���<�����$/���c�j�دt���b�j%�W���^H){{V��by�8Dٙ��]�Ѕ~�qG�[��X�����5���?��djF &:��Y�3�,㟥W�c���g~��~��Q$b; 'o��W�7�^�4韹���jS�`*f^����`n� ķ9QqB�9���`����tM�_x&B:��<���ua�i�:m����=�7ok6���i.�۲�(B���@Tw�K�]�����$���Q�oT���{W>�����G�$u�4���g��i�oA��b���C����rǳ��նo�j��yc��͖�W�\K���qW�'�d�<$G���q -��_X�_�W����u�!6�"�n��Otd8��ַ�+��P��Z��y�Z�$yk}6��ը��J��,t��N��,6�����X����H�%�=�Z'@<��}DR9�y�G^^���$��;a(�_'O�e��}��]���c[���"�"�#�0u��VV�*"��<r�W�����p�g�3�=ߠ��
Ct�7t=N/W�Y0��Ej�ٍ%i8컟Q����n2~^�>̺ ���E�/��[�H�_��N�-���-`�v<~��@oN�ݺbp��x�K3�ye�������p��@ OOMT���1��E�#/��C>n����U�N<y^LN��8�İ-o��4�q�	����zBaR�����t��ʸG�E�_���\`:���{��ɰ;4���$�.yb7b�F�T�o�*�:Bg����8�/��ay^zo�َ�!��D�b���	�-�zcY���Էܯ�p��n�^k=B�XÚ�^x���.����E"�ٟ׫�=N����UQ�>��4l�[��U�+t�
������R���y���x�>�Og��$WD��l1��h6��X<vl��4�]�rx	���X��`藾�_���5��OX��^hL��_�F�u8����h����[~�_`��A��^Y��\u;��*b,:�nS�6�jڛ�`3i����E�}|c�/����S�������'ؿ�����hO7j+F�	P]��#�x�y��|�'���f��;=��oi��ǧ6�Ř�����y��U!Ҍ���������������&�UB��ec��V{��ûU��>@�>��>7�R}� ���� <dЕ W�h7�=�� ^� �c��l���V ޳�uӽQQ�]������?sb�[�c����|�臡]nA���g;;�L^�}C���I�x����=D���{����{�E����ޠx����j�1�7	�7�S�^�
x���FI�Pg����zj��*4��VA:*
%`gR�E���1E������.U[�����o;��.�/t#�E2���5"�;�`45wA�Ω��?B��ޯԏE�m�g�_��Ǔz�v�Z!�4�l;�~8���e�13-�[^R�/��;���i�6�U��L����z���?��Ox!x�T�~���Q�L-�ab0�xA�������lu�wY��?[�o��� �7����?�~H[^��uV����Vc�y%�o� �\�JOf����]��'����MH[!����`��j�j{�C�	�_m��Dm�Q[�~Um���rPJ����F��}��Zm�Bm��t��]0A��jk��O    �mp�����O�V�
{e82U�O��k/T��'��п��"���+�}d ����Nk:�����v���36�Ζ�Fk��;�	\����w�O����7�q��qu��ǘ�P��`v�X�?���f:N:����㮳�?ZP7X ����l����S����)?2��U4��`�\� f��V.�٠�����ԺBI�RI��o5�m_�Ug�T��A�V
��Ί��o�`
�Uw6�hou�Fvpou�9|e8��V>��~`����VC���p�'��/djK����
i^DQ=��.cd�#ޒ��=B�z�6��r"D �2{�������-�A�H�C}}�w��D弎��
��|��>)�'e����A�J�L듲zRV߬�
^��y�'e� W�e��:��e���쓲zRV��q-K�e]g#?)+�QVߪ�
Z��i�'e����YI�*U�O��IY=\mL+U3�O��IY}��*xU��U��Փ�������V��:#��T0�����_<���-R�nTM�=��'�Jj )��	\X0 \�Ծ/�!�����$n������fHAN����O��IܸK��~?9�����qq�:� 'u59�$n���7+��]���⓸y7W[ߨߟ��$n�	�ͷ*��qr��*L{���qD!���qD1�t�DD�.<�Px����Y�m�,zXh�c��P�_�f��冲ք�	��`��V	� ��٦5��z�[$~��KF<�?�q�_�K��N�׿��JsN�5��t�Q�n(�g�P2p�8^�A�sı�8|���r�zu�����b��{�%����,t��7W������g�D2p����t"N�'�3p*8V�h^� |�{�:h���?�x�5r:���9���� �ˈA��[�U�8�'!�$������:����?���R (����{����=�_��=Z��� �q��; @#7UQ��Vn���?Y��W��b�O6�ɦ����՞ܮ�����'����]��`[v̈�l�'��>>�[��(Bs�:h�I�?	���RE�*S�}<�'��x�U�����̟��?�R�^-U�2u�Ǔ|y�/R��k��zu�A��뭂4d��O��I�<To�!�����|�G�/ߪ�
���_��Id<��)���cnk��$2����oTr�Q�%�]l�n�l�9��N4�q?M��q!��G���4��g�dp��wj)U����g|28O��z�`��Ο�?���V-U����m���]��ߟ��ZoE&��A��*�G�����<��ꭂy4�q�dp�ηj��g4�/r�dp��˔\ASnk>�dp���oUrMi�OS��N~.$2�U�l��os�d2�L�7���}m6���ӿ�M�|�N6�*�F����'���p��2]�=��$�'�� q�UMT#����dq��_��,�ӊ��׀�\o�#�>`�,Γ�y��*�G��_�����#X���R���K�>Y�'��.%W0�@s[?�'�����|��+�J��OU��N~�8.dq�S�L%�����$q�$�wj��jj��Ie<���뭊��'�=����}Zj�s��o���w�F���C�TD#������X��38�O?�z��ֹ⪨G����p��CW�=��+�>9���j����%V�$Γ�q����J�.�O翋��V-Wq��~��u���q!��Z�"+��"�<�?���V5Uэ@M7>��'��x�U1���d�'��`r�UMU�#��	����2�+��e:���?�➌Ɠ�x���܉f!��w��<��r�<7T$������GP9�z��Gx��'��r\��*���'����r�U�U�%���t�%�I帐��V-W���~�O*�A�|���G�f�TΓ�y��8Hx����GP9ߪ���j<�5$&"~]�F��C�ߌ��A<V<ƀ9��b�ib46�WJ����B�j%;HC(5,��qt4��UlR�B0Uh�BU3�E-���sܚ�~�\�ۥE`|��Ŧ��h��"mQYw��m�qX�fa}���͈/n�G�Y ��ׯ� ?M���K�Z��,�
�@�X3�����\ ]�B��� �'}���A���z��k������!��i���3	� �j�S@̡Ͼ �L. ޯE��9�Ď�Ш2Z$�A�����\oj�)5{z�&�~c���KlGȐ�Z����v�i^�QG��'A�ֽ���0f���Э?MS���f��]�RC���:h�f[ ������\���	73k}�0F)��lDu������/����/��GĠ�P��$8�@�:q�B���K��j���l�I�R�=�`�����}Y7���Y�J.��D�$��ɱ�N�P�U��*������g�e��R���S�s}�_4�i���T�U��U�S��oshW�t0�Jo�?DR��7[K����j�q��A�T��fnUa�Z�B7�}��
�'c�K"ʱ�Jp�/�_��������;�6_Rt}�������e��ps��W����׷���N��W�:koc�n&M�!�5������ol;�F�c��5�>d�����ÿ��.�#��%��?x��n���1��J{_����+���D�?|��
��*��[)? ��`�� �sO �\�����������#wNܙ��U��3	�T�&�7shކj�ԝ�6��7�T���9o�94q��8s�āCW�Z1��k:4qE	�����C{:T�?Bͥ�ȩ�+�6���js�z�
�j.�ڈC�VXmPs����֦�ڠ�R�8��
�j.5� uf�Ha�AͥvthOG
�jn��Ru��۠�R�:5q���j�9����6�R�͡
R�m��ft�G*���lslSW�m��v�S{��p.5�Su��\j�A��Xe��nNM\e���n���/�C��U�x��v}��/Xe����m��픢��6�0�����C
V�m�av�w�D�*�>�n�>q���Uv|�������`��f�}0q�<�Xe����mLܡӌ��6�0���šg���6�V�͡g���6�R�:t���\j�A���ܐK-7��(De�!�Zn��De�!�nN��De�!�nN��De�!�nN�*���ps��*���ps�T�*���ps�T�*���pshW�*���pshW�*���pshW�*���ps�rF�-7K:���I�éBK���ڛ[:�>5�A3���1D:^{Xl��c$�Ye;��g�62��1h�3b�i�X��tv�t��4�oJǃ�Y����%�	���9��ЇSì-���T���L�y9��"z���a���ت
�n{C`�7�^��{p*���H3�"��R!��`0ũn����F����D���?���s�?/�&&�8�9"����������iX�����f��*��^Y�$f�v��D�ў��/X�����V�쓭r�p����wZ��Y�����-��>_Ȟ���m��ݴ�|SճW~}Կ~� ����KV\J��$�)�2�1��ƞ����,�^��W�`�;�[z�[���^��~���K�	����:�Q��^K/�"��:�^���-������Ҟ�^`$�vŽ����<��JB������!��_�X�����y����'�ꡗ���5���G��Ҫ�L�WYW���`}��q�_�����Ug�����r��ߛ����x;�79a���`�$���y6��n�@Lt�%_�Z����P�G:�Pj��:�i���y�����}{sk������Z�F{���Rg�q�&��^C7 ��}N�3]v�ς�f�>��i�?s��]�f�`*f^9�߷I(�1�)@���~�����:̯~|���"��j5�.>|�3C��q9*&P���s��?�?������2�-�^�"���Ee�|������諮麮a:(<ܦp��p�LzV��8$.��=d�t�
��`����pW"�t�
ږC��5��˒�\��rH\����(Hg� n�Y��ܩ�
�C�    Ι;��]�o�������� �y�5����h/jj��g���oU/6�I�Q����V��V�t�-f������J���K��5��������I���d�bQ��?vH�˛�t!��Tz�QK���db���o<�k�Q`�^��]�s�V	�L>�Ez�Fj��/||�K�N4;�t��*��r�������.��r���^��R]�La5]��ZW+�|���8��]=U[;ZL�cR����U��
����qb��m�e_q�H��<g,�;S˚�$�*�}$cTm�����b���5��hZ�E���V6��M�/��e���v�^����bױJ��<�,�;SɚÏS��%�$�����Y������H�hfh����v�P!�p�o��s؀��� ?Mk�#+�Jp�UՕ�35�9��<��!	��M?A�q�b_?��ѝ��|�j�P��:4w��͛XK��~���mB�����o���+cg�[����)�?{0m��-�~z�IlֵRI˃�b?��� �u�2;
.1 �Z�8�-���6}��h�)��^��w���D@C����:yS�S;�������r���}�����_�uOQ��D�} �-�?l:�jR�2��ܠ������	���px>��[��3㋀���X��?�:h��N��i�oZbx�c_]��E�c>�X����E �E0�Yuw%ˠ��G5����?X&J�kDgDzu��"w,���s�"Xf�Au�������1����(�$=l�p�K��ٸ=/�� �+��ƨ�wIi��[�W��:�S�	>����8�-~��י�J�)�A��nYNa��[�b&U̶�\"��s�Ҽ2���hdН%��ň$W��0-u�c�:�-w�י�J����$�W��Y�z����
�h�2��p�êS��7���x/j��֕�2Su��#n�#/P#
��U�ï��:�oKifP��U����3<Y%�h1�7}�h�8��X`�H C6��M$�+�O�*�7*LFr��J� ���q�Ӗ��v�� ����4�1F{�n'�)m���`^�B���W}Xo���+<mC U�EB��6�v����b-�1��a�n� ���[���v��|n2�?=�[-���@��{� �2h������_��y��qŴ�m�����|f�f&V�v"���)hm���Nԃ�F~����Ȱ����|4���p�߅��]c�M`Ob�KN��������HX8^��芝�"!��*��r>��N�?�������z:�-�^�J�S��As�ε�No6�ab��#��f���`�� ���w���fP�x+�4��ͮ����\6��BQܯY�D��/6*�G�\ ���-0�R�7.��@��kXg
��- �W�w�S^g��Pb 8�7p.m���=Cc��%��t:�̏��R�Wm��@��'���U�ә����S����[��K��UB௺�����=�[�
�B���چM�㡉�D�fw�X(�6C��v��h�&�g݀?�/��/�)���;�o���.��)OVKIw����?��A#�Ik0:T�R2���(ذQ���>�k�om��g��/�� \F�|۷J�UW^┧'�|��)m\|��-P�͹]H*�H|QkF�u$�L����~�<���tޚ��g�g]��B�-?D�
�<>Y ��ZO��؍�ꛢރ��x���Y��ٳD�m�����Xz&�u��c��iLӱF��UB௢{�S.�,�3$����n��H��g��b�GU�V�p7��i>떏,�*�L3���~�
�'ډ�Ґ���tO�[%�*��:���I�IC7�X%�QNe� ;lF������}�h{��/w�`�	J���BD��+�[V	�vs�E�k��gS��?��qݓ\¿�Q�zGQ�HG]�eo�Q���{��F"�U��o<,�������^����{�dp;�#�.�xѨ���uIEK�V�=�ڞ�,mC�S"2�|�#u�QUܛG[��q�����m�\�b����3���i�x*��06��c�A�Uo0JN�E�ֺ'v�4^���5����Ս�:�*Me1,�[(�p����4kjy�V�M�_��(���B��_踒�̌�������
��E��'gՍ�:�*�A��vXķ8ja)����5��� 4��"f9v+�du����H`?z�����\�0����_uq�Ny����.���՝����M\�|�h e�u}�-��e��"ɵ��Ų8���yO6(���p~�"/ ��!��L�$�ᦨU��b�3�۵��7�;S1����n1ܘ�8��|�d�3p�d �� Ds�d �7,��%n3�U��������T��*�b<�L��٥W%ynM�v�>��*��K���)z.#A-X��7���oí9�Ne��oí9�NU40T9ކ[s��9��e�e������3Wx EX�;����ҙ+8��Ι���Y:u�	'� ݩ�w53�N]aĉ�;w��]�m�SWXq"�ͥ���+�8y��Uwl�
CN�}�t՝��W.]tg,9xXc��[M9�6x�0�D��;�����p)�{WWg�ԕ�p�1����p�1��6��p�1��+�9�0c�rY�(��Ҙ3�Oݙ�0UgHF�;�N��aL��c�ٹ�Ac���B���d��3��t���B���\s`������5�ʅ�N%E���P�=|KJP!blv�A';���y�Z��x�6��U^f���f��T��&
�P�44�X��L8�TJD��Z ��%�d�30ε��4�EvIO*f��!3�6C�� �u�Ę-���X��	ʐ.��'gUBu*3�H�))ǐ$%Ŏ����Y7x0W����p�`һ�ow����V�d��� ߏ? "�@�`r�-}ex�SyE"o<�d��ҧ3tl��Ɵj�R���hV�`�ˏڝ m'�`�D�G!|E��e�/�J���N�ETw����i���R*Q���-����L�Tcz��(�o�I�I�[��c��hT'@�A�$���Fݩ���NZ��Uİ΅�H|�@���`���֋�feY���x?4ꗳ�i���x$������j��%���Fݩ���>U��jo�KBbo�ɬL�I`Zn�J�^r����N���qc_��d��|�G�}���۴ĐV@"gx�J�ӝ���LY\�1�I�z�f0���J����hh���L%�a�o6@g��炾���^�ׅI�cb��o��_��9��x��m��j3^7ڳSÑ�K�e�ԭM{��eْkE<N0�^J!bW5���^��Y��d7)e����4�ɬ�y�]�og�ѥP:q�T���-���P��@��X`�	���Fk��;�겞r^Nq�"�"D���?�e=�z	f:�Vr�ݽ�o�7��7a���aL�.�
�$?1�K5�)�@u�םʘ��빤�ʱ�Ij*�v�(���81m���I��膚�e��ʾ�����J>�[��B	E� /�?f��*!�W]�u�2&��ʮ4#�+M21�6F�㴽l�@=4,��p�������l<�+L�Yzta�W���$�*�H�Uz�)wV��nrK7-;[5�Q���� ��f(�/&=:�ŧ��w�juXJ�]����4/#��/
�-Օ^wʡU�2�7�����+��A�P�+s�w�{
�a�I�A���$BE���}g����m�e��a�+�	���J�;���C��������|�7����s�N>�O��1ح��f���zu�J2�?�dL�X��o��+��N��Z;YqWS����J?KՋ��!�XUjKc_?&���J�C ?�W���j�V��<�����t+a��;�3	��(°�������G.,E��q�~���]�\���}������9y��,���}jh/lc�7�Q�~b$a���e���J+�V�}7�����m���ScW8��g�ŀ@�p Z%8�X��bN9p[{Y!QS���0�'�)�`�h�f#XL�    )�m�&��5�z��<U 5��Ua'��uHI����k�� l�J)-�/�z&H���4p�и�l"�7kh6�q�"aK��Oa�X%���N�)?n됖TT���[**���#��Es�԰6����8�m��M9����~t�Ԏ��Om54J��6X%�*os��Ӓ�0�l���Jk�)��R��7��t�~Z��}ƃA�|�w�?�����aU֦EB���0��=-ia?3x[a�H�A'�@*�2�%��w�CW�D�ڎ��Ɩ$̙o�_�ȣ���*�g0�Xy�UB���0��=-�������[
�U�n&��x�L"���Vg����35��B�n���%u�D�u~�ґ�>�UB���0��=-$�?G7ٟu�c�\ځ�$��Q@����21b�Mn�O�Bz�v��O�%����g����9��ia)����S�_��<$�AKͷ�5.&���Nen���8خE
I �����:%I냑3	�������������?���MrHC��1�l��8\���q0c؜�F�u}�n�B�ѝ�����%�C)�_��@_u�e��~���7G_R������f�iu���{��*4'k-=�G
ʡ � -7C����_a�"�]�t���ə�����S���Nz�-�n���w�dఙ�=�q���!���F23����(TŨ���\���lx��5C��J�U�^ékoo'����������y\D�G6�7�Me��Ս6����C`���k�I��rŶ
��6�* �WEZ�w�~�����ζ�?�>���f�z�W���7��_v����V���� /C�DT�(�}*0̴��kP�Xg:"�E��o���q���7b��'�:�˙���.�BԒa�懂7!	>��I�8�g:�'CR�T���)�1�r��RD�H6�@�"����S��15�\?��-��~\�d{�^/��Q��Ad�)�a{�o%w�R������0����@*m`J�$������w4�R���Av؝&Z��*x�S3�'�,��h����J���|�G��z�0/�� 
�*!���G����W[	~����T�p�C�s�Ζ�~�:�֐��-�'C��F�?�o���˨E�-��-���j22@5���,��V��㶖���x��vF��g��R%��,�HǳVc,�r�a����h�D����d}A�~&!f]e���L��\�-��v�5/3��9�疇�r�$����=�������P9��H�Hd������c��F.+�{zvQ�v"�Ȫ]��z��>����9/f��[���"�KP�"m����|�S$�_�m��ަ�/���κҎ�d<n갓ϱ}a�D���1�_��e�t�"�]h�SU��U��O��>�H�Hd$C��B�4�0�:��b�Y��ϵed9i
�6ff���>X��r�?}A�eT��e���U�]� �{�mo���׍ޞ��������B���Փ�.�U��t�U*=A>qt@�M�//���`քqEU2�S]K��O�����/�{���n]���]c\2��X���~gc���G���x�����uJ��虄�_!c8������Li�9����9��v�0Z�t�Bq6�_D#�%��W���LW�L�\��f|���<���J]�LB �3A���r׺n�>������^�Tf 0,�X?�
:���L;�1�ٿ���c��=S �,*��N�½"	Ɛ$L�vQ�ɵ+�Nv�i��F�PYЉ֩��5D��|l���Id�K�tpa�~bM����3	��"L
iN�壝���dAc�5����J s�d�t�dd�����.c$e��'�>��I-hz&!�W�I!�)�|t��I�7�I��r4�3��3+��0�(���]����u���X������$�u"�g�iN�d��9��I��:7�^���I��֛�L�����n���	��҅nm����+�_���R��4^��I��9œ�4YKsX���e��򴳑R����䦲��j�Y�lU�
��m�L�F� 	��~���B3(&�0Az&����9�A�����z�r	��C���U��;5m��Ą�;�<�4��[W=�0�@�ￄ₿��B�%�*!��p��qr��Oqr���ix{E��
����[Ÿ^�9��i��%��=��1��x̂��<�H�S�FE�t�+�/�1[�H�����%�=*�-/Wn�|`-�9����Q�r�����M��N`U�m�k��9���u���Y@�45 .����kD�e/ �˟�I>XX��#��Ա��Kʥu��B�4Ჴ9���Vm����t��ն�q�����_�I����D�V���E�;�mbPM�g?��un-o���%U����n 9��q�?^�N�~�+R|#�����j,;����r0{+C~����t�~�2�c��wtB}Hp����\bNEu�)O�9�w�F���o��z�2ێ�R�-@��B�S�Js���r�E}Z�3\��x`��V��B|����gH��`c��sǅR�O[���]�{�J���/���o'+���C7��̶��H=��x�Ƹӛe~�QF��/C��n����}5YqA� x�"�� %@���3	������W�/�}��7�R4��|83<�*��`776Ff��/�ʘ��,i\G�|�)�A�y�T\%���8��-���ǔ�D��*a�Q6��g�������d�i?+���Dg�t-)��>n�	�:J��%�*�p����7e�w��-��/nP�loj(}l���Ժ�t�:��J��ٮ��������2��[$8�L���~���*'���t�;�d#Pk5<��l�?�g�Z�]�$j��bUE��dwY����cTgH��F�$��\A��
�e��1{�@��d$i>�o���!jНg�o[Z�S(��C�ڴ]�ʀ���AJ��%�*Wp��+R�e��c��J����]��g�ݚR皽��>Ū���J�.�g*nP7���!�(*B�����0!Ich:Ì���ZO�u���������E��,ؽ8���ɭ���1�	^��Gbc�x�ru�M`,�B�C��x�{�}B�Z�s��R��Wǟ�LCx�܏��ۏR��G�s�ut~q�֠����C�s�9����^�?�`&�ª�'t���<�h)���&�U�R�U�l��zm�;��7��N�Q�]tjk՗�;��U�Զz����h��/])���	��u����/'4ǤA��5峳+g��k�ox'(?�:�%������Ek��-n�>��k9h����Vp�#���TG�=��տ.Y�˓���Oj���t��f[�Ƌ�P}�fi���?v.������;oG}Wl\\��ڔm�u̂�,�C��}@G�~]��WFI��Ӝ���[��'W{�7���Nu{�y�_�����h�o7/]�ӭ�T.N����n�L�?3��C�/#�}E���jq#�~n��?<��*�o�Kv����=G�Wǯ����ڥ{Щ��������&���/�������N�x?Z�=��վ�����	��fi���ף��מ�����Q�zr��`���������r��Ź'��ʲ������&&T�2��w{�to�Z,��7�ڸ8.��;/{������{�ֽ>�m��u'�j-U�z��^怬9��}��N�j	�>��U�����p�&��(���X|��8;���r��o�];o��{qsmwp�����C9�|:���=W��tYA*r>3O��C�/��|��b|�����������r�٭�OV����}�Կ�R�U^:���n�������SOaX�[��W����:��g$�?���Q�e���q�StEn���M����F�B�]�n�Z����`���t�=m4���,�ɬNOx\'�B�J�$ht��'t�!��H��(?�G���s? R�:�#�����Y�����[����I�����m��    �����ڝP�I��V9��ܛ��+at^`*�������:���g$v_߉/6���S-6�6E���~����g�����csͻ�2Փ��^�>��y��v��0�B�#��d|����:����$n_��c+�:���4+͵�ѨS>mֺg�ow���jgk��d����ߪ��ʠ�T��eڕ���}�ԓ̏/3�	|��s��xX�%;���4�ι�n��_��I��p�_Ĩ��+Z��w���w�k���>��ܴی�_�HVP~������u]r�������ʱU��i�v������{���y=j�(��<������*ׯ�����N3���z�"|����<���|Nb�u�p�I~�IӃ}k�:h�e��S?{S�>w�ܝ����֕W�m��:���wX�E��/�u���A���q�g����<>'��a��J����&X��A�Mq��v}S�,�d�����i�kA����a�2��[_gUM����/�f�x��S����>��mmq��-|7�����nk���^�lv+���v�no����������N:����׽��o����P�r������yB���$�Z:��\�������9��ޮ��~�nO�S�=���6�����]ߗ[O7��λ{Z�}">��t�����^��'�,���9sO��C.'�p��_�j����4n�f�[�z�fOϥۣ�ݍ�����f�Q~u�����S�+�]��"k�W�����<��:�P�˩*���k���+i]3��p�:��y
�����@����קyx�Z�)��^���{�O��i�3��s�Y��в�v�8��O��C.��p��Q��T����tv��/?��_�wͻ�~ic�stw��Z�{��{z9������}���_���I}I?���	|��D��XVcg����H>ˬ'荰*������*��Y�+�͝�Ju�r��w�;��z�qQz>dw���'��M�+0.�Hݱj�x���8C'P�����e��=�3 �����u?���h[�9M.v��]��kx��x�|�wk��+�1>���ަr�:��-�Q�j���|�idP�X8oƉa���a�]��4�n�������nOe��F�'����Js������?�=x^�l��i��������=9�j���c�a�sW����vb�O��CŮ�)v���*1����FStR�<�9)y��gq�y��מq��~w������������3$�M���/3��N
��yB��wM��1��Q�����)�N/χ������o�����������������>�|��϶<"?M����`)�pzu�˜��yB�*yM��_���U��S��WeO�m���Q��(+/8c���������U��n��G��n��p�������,��^%�g��}B��zM�;��D�8���%��\��ٽ�9��?n�U��������@5^K;��r窻2����+��~���u㻋��O��/�k�IC5�I��¯��C��N��<���;�Wwg~Z�8P�.h*�J��Tb�4���y�47������Z���?�Fݽ�����ѭ:<���m�oɏc^��K/�e.O��6~qf���vAS���w�}0u�/�`ƿ��t����v�vkkO����]�k�/��뛓�mek螿�_�Eşk��|qg����vAS����I�c�g	��,�Nn�K��M��b�[/U�NG7g����DmU^���c�y�M�Z�0*���ݪTx��0߁�yB�O1���ӎ�zoJw*x�˖i4��gT��P�+i��&���vV}�6��J��t�rt��zqֿ[�i<���/+��߬<W����y�|W�̅����t!Pa��\���DU��f�a����3>S��qp�v����z���l67�/���/�������m���N�_�>k	Ly�_X��-���ff�/��	xw�qp���oQ����a��ӟ#����@�;��0�@�a�ҝ���4�?ޗ��@�g�P�;~a�#
cB߈�6&�f�y{�{�}[�����ݘ�etR��WR-��}R�U+'�_�I���v���}�exw���}|���͝�����ln�[|��H3jlW�	ێ��O�ч�_I��VJh%0�~R+����>U�[�n�]>ݩot�=�}�V����˳G�Q~~?9�{��>9�}�dX��מ'џ<��U��j��U�����i��hpڹ�xm^�Ž���}s��;'�p���l�\�n�4NN�J�_����㾘�nc���:����L�c+�ĩ l�����Ix�׃�KR�V�P�C���i;�����oT�K��Ұ�����c'�9!g�������X5�5wx�_{}Yl����M�~P�������"
���?�>	��	h�^R�X��r-�cV�]~��1sܷ������՟?�˞�;�u�^�d�T���K�������*�J��I[8cv�
'~fb��'t��u���R넅_};����Ù�\o߳���^�>�j��/������f�h�9Q�,;�B�+Ȁ'���?�D�cP-���r��c�5X���&�X���n\z�߭��.����z'����A�~0��(=7v�����z��	 �I�O����	���1���e�b�"���&-&��z���|�'�^��Z�,yA��d5H�����{�ZrAz�G���=P�`�D���}8�l�j��y�w>�������V���8�߰���p���Sly����v��ʹ8z"<=Z��	y~��	h�AQm���1fd����i��{���}z�����{��c%u}~�{�����Z���9o|�����<9�9�3$����	�����`��V���O����X�r >=i̛>&�U�_�a���%8����Sʣx'��֓:��� 5ݛ���@�uϯNwz�s�T�n�q�>i������C��u��E$53DW9AR����yB��C��qyT�ס:�"��ۇO��6�?;u:�R���b����[�C�7|��8f���3����㯗d�M�pƆ��'t��:TQ-��Ŗ�u��Bi���@��]U_���k�w�u��|(���g�9���#yu�� ����晴}��:�P��֍�n5ֆD�%R]�}�Z}5�O�['�u���k�ݶ�ڥ��ϭ��v�}���u󱗋T�R(��G6g��/�TQ-���X&<�5[�0�������ﾽ�����nc��j��a�}x�8�,�������#ˆ�o�	�[�q/P��;���?td\Q-�������O���'�۪lm�����{�������E���}�QU#t7_=���������LL�?}B�:2����2ހV�;�m����n\�o��_�{�ݡ<��<o��|�l�T��q��C��J��M�P����B�~��w�g����VE� v<H8�ƿ���~pTՃ�wR�(?7���;%v�-�f����t�♼	*����9	]a����}�j�Z58N����
�!�U�cgm����r0���筆ظ8.�ϯ��'r�8,`r�'2�L���$4��<���{T�a��&t�Y�ퟱ�5��ؿ�5{ŧ�?�>����s���֬���V�\�N���c�����&�Nw�	xाC�̧�`|xQ(�/���������*ѣ�ҏ���Z9U��zz�~u�p��5o{�w��8}�ڹo]�����8�:�����N��`�YA8%��s���D��J?���je�f������kW�����ܾ����1wz'_����e�mPvۍ���������?�~�;���?T,zTUz�Z쐑��\x�Hԟ�Am�vy�|z�{�=us=l_�?����j�q~��F7<�b�/��P/�K�X��sO�MN�nYt�L�[��x�`�,|X�a�_��Ĝ���r3�Gs0+L� �=���c�Z�mջz�I�UzY�����������A��t�[�?޻�,ݼ7�����(������~Z^�u\� �<���?T)zT+%�a5�LK��e������uג����ס{8���^�y����z�    �^+��W����(�n�a�S`"|�\w��3__<��*�;��<T"zTK$��Y���c�Mu������s���u�ݳ�^��Z7�[��ѩ�l�^?�ݪ�8<H`��fݕ���~!����>����I�)'���+ͱ�םno�`t}}(���}��}y*�>5v���S���<x<mVN:�>#o��sGG��pX�Hf����D�%�zϤ��;�����q68;�qqx�/�]|�a�\^\���V��>�N�w���%r��?h����[���:�`�E�H���	K䏝Q����}�qۻ퓯��Ë�J�z�:{B�;lt�v�Rn�wF��vg9�P&΀E��'t���˧Z$��8'c�T������ӱㅟ&�Ǩx~u��5|�l~~}�u~�}�vӓd�jV�����Љ��ݹ't���˧Zu���cB�5�fi���Z�c�������V_���j����Y�#���ӹk�_�����_x�}#��c�{���a��E�S�:\�*��T���b�}i*>�W'{�Og����x�~:;ݻ��������k��D��\%�"�YA2�%4r��	���V.��G���}t���v؍���������s�ZY�(^���˷QM����^.�!����LA[��O��C��OU�^�	g����R�Q?<�{=�{ll���k��;u)��a�y�W}�u}x�6w��wɶ�V��[�0O2�xFݝ{B���|����%t�����/������ų����ws~�>������oYwko��~wվfd��U�/� _�Uh���	�������������?�e������o��'O��?�+��������y�w�ݯ�\�?��&�:�V�g����/����	]]��/��[+����G�O��������E�:Cq�sW�8튝boԿ99�v�v]V�?�t�@p7���'t����>U�{)����'5Սſ��p�o�j�������oN�׭���=���+�����Pm�\>�X)��Q��>�{���	������KYNX��������WGާxi߭]܉��gy�R>eןo�t_�_���JUm]��x��>��8�CGdf����߀��m����:��!�tz'��~�|�/�nK�w��ǽ畃�7����q�֫^_^��~��$s���9wd�����'t���7��C����Y�m'�?��j����h��ޕ꽲�1�Q���y�l��y����]�?�`�e�������M���a�=����ߖL:��?�lvHc��_��n��8�.�nt��_��R�Y<��n�����㳻����_�?�����'t���7���	̼0��̼�������}���sq��z���{��7����w��S�r$:���^���������$��fsO��C�o@T��f�B��|�yf�q�ru�?z��n[���æ,=��Γ��zJ�t�r���pjI���M@��X'�����7�S�=�ٺ���'W����:�P�U��dV�V�v{����έ߿z{�n~�����s���^מ6z�W�|�u���'k���!9�|����=]G��9N�?�{B��z���V
]gҪ��W�U�Q���w��*���Q��9ò[y��[�/�!�������˄�&!2� 5"��|��=����Q�;t�r�J�� ��r^o�����X����6^z�G�\4w�?ܓ��3oX�n�^��z�g���>�@2�&����:�P��Ժ�Z'�mgPk�4k=��C����ݗǓ�˷f����=�w2��Q��W��{bJ���[���6gGr?�����_׏l��no�o|J�gڞG�x�cc8J ��G3��|�u�?����׈�����M����m_���BG�z�O\�����H,>�F~7��A%~@R��rq;a�%|�[��Eo����~�z��������v�-=��܌�ߪ���`��ܨ��d�څ����Y0�'�����'t���^8$��~X�D[�{�p�����K�yyү]�����b�X/_4��֑�����n��N(,1�n��s}�ŕ~��FZ��'tԁ�^8$U}u�0#��F}�bI��(ik�ae����x���(w�6��ˎ���w��(W;_{O/��/N����:	���l���1����2��'���@I/��^�I�ܸ�s
s(��k�Ҿ>y(v�j�{o����ٰw��<Wu�xz�_�K{� ��������H:O�9^3O����pH�y|_O��O��p�o��X�?�������aPy����r{�]��_���A�s���v�v==���RNA�*r����>���"c2\��T;{��b���#�A�"�b��Q��=.����7����:�?��v}w�n5������������!���~���&������~<7�����O�<�&�y�v}��pL�|���ןO�=勿���#�0#� $����	���?&��?% �=��	��0H��+	��o�'S|��� ��9�C��#�f��[u�X\�D�Y��*:�N�{9��<*��ao���i�ɔGǛ�� ���p	��|��D�~��Ȍp7�'�<H8�g�}*�>$��3�C�<���|*��{�b��k��?�ܥR�7/���j�:���!@�J���*���g��t�(�g^P��5��y&F:�	f����Jϋ ���K��Պ�H��$�$`Q�x�b�����V/V,��2�{P	�嵄��'<����ZBR�j*!�_+!���J)�!�_�!�\R	�jH?�5�K�*"�����RU�~N�HF�5��H�ת�rN���P�紌ddʡ2���2�S	���kS9����Ty^���t�*��& ���C.��. ����!����퐅rj��F8��y�pdo;d�_�pѤFjT����~��-VN5���~��-N����~��-�Rmt��~�����j�/�\�kn�rF���pb�M�?�[�47�3G��v��z�>Ů�(L��2�����N pbq��`6�]/Irdt&���zE�a&	���E�^��o/�l{�Y��r�k.��J~�����_��ء���_+#PN����*��2��d�(#������L��������`��<�e$�1�BF�6S�~��0�<���0\Vs�PJY�}��6}4.�0$��%��O�|�o����D3R8�B�sZ�R-���/�<��/ъG8�B�sZ�R�x��/��ͩ�Z��1Hy^�'ъG8�A��j<Ɇv�x�y5�D�F8�A��j<���p ����xR�@)ϩ�#+6\�¹y�pTc�Y87��ȶ3�f5�A��j�U+軉\��t�3��V�j�r�랹��kD:0���q�{���cܼt�k�t\ђ��lD:0���U-�KǏr��]&�Y���Lv,�ګ�r]���9,Q�7+�B��}�&�G�Z5�����H���N�]h���+6*g�`�Ñ�j��ȋ��#��C�e���K�t`y4��[7�^:������+�p��t2�	,���q+'�K_���HkI��Zr�2:",&YN����"��b�崘�YAR�+�nQ�!n�-jwA\��Xםۃ���ܢfR�u�����r���x��s�e1D��3t��C���4F:��Aoy;N�����h��_�b?' e9�.@�o�f�	XT� I�!��H@�z(MX���"E�[����D�9�Q�2�3�R��<�Y��t����@��M��hZ� �S�An�K2� cG4�"H ~b$��B�b^eM&��pp'��t'�l���;<�;d�?\��y]��*�9���GU�sp)��u)�j��Kq<�KqT�\��9]�#[���R��R�,��x^���Fxp)��t)�lV ����oc�1���
�+ߣ������(�%��#A�r��UEᴝA�q����>ߏ������f������{����o}���4����~��NF�Y����z�]��$~�?��>H�#!����89��=H ���Y�
���c��{�Q]u��'ۺ    svFGw���/�݋���ͣCy�Q~�8��D��I�,�0��~}os�۲�|�Μ�0������E�1�	 qD7
��ǟ0�' 8b��(�?�FS�["@�O�V6����`A �$a�6c*�F,�<&���V;��a@z�B/�t�����Sz)��tu!@��f�R��J9��;���U��M7����<ȝ��U�f�	���!�Q_�Cr��Y�¡k�e�_�%5����<D���U�f�)���!�Pf�|��
3�Y����� ���dB�x㜹�'��[O��H' 8��e�/���	�� n�$�_QOͧ �n.�sܙ{���vs��y�;����XC��)��s�J/�9�P_�!��sN�*#�ǀ2WN���B�<���N6�AU$�P��ޠ#o� P��Z7����?����y� y�'s�T+&�i� y�ǚuk�5��K����\Q����������c��_&	@�/!H�z�O@�y�$��n�H�~�KA �����~��%t�6@?̾��*(�����=��qۀ�Z�!�yN9TD��nE�������^v*��"q�-p�4E�S���������*#ů�����Cu��i��sN9d�įY��X̳tl�}ry����+�κ�g�}%S���7г1�	 .s���SS$�_P@G �˟��H������ 8�!�?Q~�P�?���{�	���N pC n�$�_0E-�'	X�E���|
B�Y�_[����R�eA�)�׵,�"Z�y=AV�BkY2�"�-fɜ.f�����S�9]�"�bM٧��E�����O���bV���9��b���Ŭ�ʩ&5	�e�_[�ʎ�8'rp��\����U��ͤ|@��Ksg��%5���tr�0�0�}�IP�VN�����& � P�VN������ �J@�D�l�a��p�r���c� l%H�^��	�7B� [	���r��P$��bE����F�����ED�zV>�ݴr`���#�S<��x�G��Q�lW��q��cD9�L\9���}Ċ���V01��*�+:&�{)���S��q��cDy�S:��x�G,�QN5�A�x�G��Q�b�>�r`���]9��C�ϩ�#��C.ȩ�#9� ��L8d���8*�.!���Q�v� ��̴+��95pd�]A.ȫ��2�
2pA^���M����Q��qm�<�N��pp�ɩ��R(K��p�ɩ��R\�M��p�ɩ�#{�'��Z8�J�X�o�G�}ͅ��>N9���-Ɂ������r¢ ql1z��:c��NN��O50{��N^�'����S89��d��<��S��SU�<��S�I7%A��ͩ�����=�y�9u�tC;�<ݜ:O��C��ͫ���b����ZπL9d�ܜZ8��=��
ϩ�ST_srpnN�G�=�C�ͩ��G|��aPGF�Sm����à��(���!�a�Ω��}��a`GF�SU�>d�0�##ʩ�� �pؑ�T#\ Y8gĈr�Y-�<�3bD9��	 ��XU���^S�9�pd�=�Ԛ*ϫ�#�!��X�^��aH#V�j��0��j� �pֈM�]8��ðFl��<6b�o��0}�m��<�ϿM�]8������ɷh�)Q}Q�\��K����Pfb� 4唨��+'��p�?� �)�DuE]9�������WH���
^g�������3��VYklĈr��3�<F��*���+Ǜ��r�Zch#F��fD9d�1�#��EED9d�1��W�QYkmĈr����rhyC1��jVs��QL�m#��K����(�ɶ]�!�i�mB9���p��6	g��ôضJ8d�0��2�1��Ty^�i����sj��L{��4U�SGf�c����8*�#M������퐁�y5pT��AN����p�?�rp*�n�{���9d�TN-�
�Fg��s׼���p�#��7���Lo8���<)��/8O~R�r�*�Γ�+�!�rj<W��QO�S�I78A�S��x�p�3�2�*�ƓfX�C�S��x�}�!ߩr�;W��Q�N�S�I7�C��˩�\�b���Hg�<���lh�l��s���rY8/��j��[��sj�V�QY8/��jh� %�˩�[�RPD9�༜:�.�D�C�˩�[�HD9d�8��Sm�@����d��js�$�'��j��$�'{�T�9(HO����v��!q<�+�� @�@�x�WN5�A����d����@�����S�@�������!F�@�x,r2��C�x�q��D �<��j�D �<��j�D �<��v�Q"�D{|;�(H"�=�b�$���2J�D{|;�(Ay���1F��*��B���u�_�N��e��e�w����A���+\柏�N@�JN�~%�.�	���2?+L/�gs�?���e� �W��2��HAq�?���sV��� �u����WL��.��秊�Zb�`F�#睸r�YK̈r�׈+���P��(G�˸r�YK̈rdMW8k����P��W8k��kQ�<�W��J^ˈr�YX������r��"1|-��Nb�Z&�S}�!��൬98]�*ᐁ����2��Eb�ZVYW��"1p-�D`���U�D`���U�
D`������M��SX$��eD9�'d���v������Ղ�Lo7^p<�U��כ�?�3O�Hƨ�'�#1T0#ʩ|D��*���m��r�{b�`F�S-*@�����P�=lWyO̈r*��c$�
F�<�:�6�+��'�
fD9٬yO̄r�qڨr	�c$�
F�<z���u\9��0T0ʩ�	�c$�
fD9��.!r��P�L|ϩ|���1C3�s"�*c䘩�_�p?('��e�2U�k����{y8�DΩ|��%C3��jB�H̄r��!	J$
f���%��1�#��ĕC��1��,琅��x�(�*� B���x��W��p��do;d�0<��R98�ǈw��W @���x�� ���q�T�!D���x���{1J$�c��b�H�����Y8�Ǆr��rp ��m2吃� yl:�/!D�� y�LjT2�Db�<F�S-�B���PN��!J$�c$�T,�Db�<&F8�u��cr�yr�w)᮳�s�'2H��;��} n�O�.�.3#����\���8,����D��$��$`�m��	pIn�?d����5��s�ί$`�m���,�������	H{�?]@g�*#�?=�}/�Ҥ`����(#)��ݴr�Yc�`&����M'2�&�	�)�x�	�|5�eB��b5<�r�Wc�ZF���"�)�|5��eDy�*2�r�"1t-#�S,��S-�b�ZF�S�i�Eb�ZF���"�)��F1x-��C��2��l����eĺR	��eB8��8[�&��W$�e�e��+CֲʲC��!kYdم��8�w���iٻ�ނ�L�6K���n��^��n��Gu� ۉA�YUj@��A�YUj@��A�YUj@��A�q_d9�|'	fBy���t�!߉!�y�ɔC�C3�<Ŏ|:�����T�d_s�zb�`V��5Fb�`FrN��p"�U�s�#1D0#ʩ�C3�S�v#1@0��v#1@0#ʩ�!h�� ���!����=�,f��Y8�H�J��&e���,�橄C����9Z*ᐁ���h�����js��`p`F�S펀p�'{�jw��(�ǀr�z��(�ǀr�gN�p(��&5��)�ǀr��pp
��1��jl��$
���^9��!8�¡x(��!:�¡x(��W <�¡x�WNe�!<�x,���D�P<�vO�p,�l;�'Q8�E�(��"�
�I�cQ��I�c�m�0
�ȶC����Xd�!̇��x,��1��������r����41�q���	���N@�JN�~%���/����?7p�?�����$��J���]ǡ��    ��
�x�?��Z�
��C��A�ߙ�M+��5��e@9~ʍ(��5�����l֜r�W��e@9�ZG�C�G�2�_HF�C�G�2�_HF�C�G�2��hlW}E��Z���
��(Y+{�+,�F�Cˣ8���dc;��pd���wA"�!�k�p����r����Z��v�W�e�mѫ����K��gA`�\p�}'��L\H[t�y�Gu� ��YTn@���Yd=!j���,*7 j���,*1!j���,2�5F�`Z6F�`�6F�`�6F�`��5F�`���� h����,�� h����(�/���%��r���`���rp8 ���ˮ吃��lz�!��P���Q98̦�9��p@��S�v�p<0©��Q8 �EC{3U�k�)�,f��äL�������p8 �M#d�p@0
�Yu������ZjF�C���\�
-5#�!�d�d�s*�
�IƓ�r*�
�I�Ɠ�r�]�O��4��S}�!>�B�x2WN�� �IƓ�p�=�N��,�̅SM��D!Q<�O�T�!��$�d.�j*��$
	��~X�Zt��$
I�ǲC|�D�ؓs�O��,{L��PH�=�
��PH�=�
��PH�=�
��PH��5��|($�&{G5�A����XS�D0���?5�������έ�����p����jW������Vڥ~�{"[[%U��.ζ��B�P���]}���Ǻ,�.�j�_z>��r�5��:_�QYTڃ��E��,�����K�j�<F�?#K]�p�~���5q�\W�o�<���q��ѹo�=���w�r��9:*����C1���O^�������?O/a���L�yk߷ð��ߺ�[p�� ܂��'��_���F�۽m���<�uW��b]�����C?�{��������^���QP���D��6P����N�/#����	s��V&�W��G����W��.RB����秊C��2�^9��F�C�	3�\�
��"�!G���e���"�!K���e�� ���H�Y����LD9�*���e��ll�Ve�0�앓��Ъ,f���.3�+��/
I3�^9���_�f��r�B|D8d�0��-~9:��pH��=��($����_�03{l;~A���p �	3�Ƕ��$�̞R� qf��W��ę�S���$����_<$����_<$����_<$�,s�Ts�}�03{����!af�3��Q88	3�^9Y��!af�+���(������C�	3�^9�hdD9��<$�̞�9�}�4�̕S�v��!af��221��T��98CC{��2U�k.���吅C��,�!���Y�s��!af�p��C���gՃ`N��E<$�,s�+\h�(�#���zD�C��>�D�Ճ�"#��r"��Ax��^9�.��E<$F({�d�s��!1B�+'�d� ����e.�h����""��p���oH�P��9�p�-�!B����!D��$e?�-�z��C"�����C"�,�9dߐ!{L���({���!Q<�+��C�x�)V D��D�Xc�!B��$�do�&5��!I<�+1D��2�wƗ��ź���`I�]�(�������6�Or����Sޅ��Hfc�5������E��'@x4���9)oçK@�����'`�}x���i�û��	H{>]@_��"�?=��L��� i�������b�]���w��!_���P�b�I���8��)��t�!_���P�b7�r�W�p`�����C���P�xO�OQ?�R�S<,{��'�8��k��O��Wߨ�7�Y�՘�νuG\p%�"�񗯬���g��9���й�Voq�2���!����PN�8 ����PN5�@l,�^�Jq�(�r�e�e�_�!������(�������('�!��#�PN6�A.G,�~�R�اR�]<��@Ω*���e�SU���˲WNTY��!�C�PN5�Cx�,3����@|�,3��jV� /Y��r2�^<�,{�)��Y8�,{�tF�p8b����e� /Yf@9U�!���c�P��XY:吅�A�lz�!���PN5�C��-3�B�=�,[f�t^<�̀w���%��p�2��v���e�ȔCG-30�Q}�c`�����R�"zx8j��T#D��p�2{&5���e�%ȔC��10�S-9C@��1��,琅��k(�r�����k|ϩ��!�����80A��=<��@Ω6X �����d�s��yx8z���S��@@G��(吃��k챮��ñkT+Tˮ����k�2吁��k,2�����k,2�����k,2�����k,2�����k,2�����k(�2� ���Ȼ�8�ƀr�Y-����@���Tŕ��<MÂ�w����M+�� sЄr,�)����@#ʑ�h�ʁ�<��4�٘$��S0g �(Gv��+�� sЈrdO��r`>0� �(�ۡM� sЄr,h4�X�	0� �(�ۙyu��x�����`A �U���n�t��k(�������ҁ�=��z�HGZ��t`x�#�5#ґ��q���JG�-6I�P:�n�^:�(,�����Uʁ"=T��[�W�]��K��P:�p�(�@�*G.��\��K�������t�N����a���A+���nD:�w��C�y�rd�A+�[���v�j�PzN�Y���u��=�:t6T�S/����z9�"����q頙íBg/{�'.4s�eh�^x�l(=�f{o/.4s��hҩ�u� l(=�f��������Q��Y�PzN�� �u̅t#ҩc�Ӱ����9�Q4s�;�v�m���\J����V�	�ؖJ1�Љ�PzN�� ������a[�ť�^s/݈���y��Ć��j��}��a���N���fs7݈t��4s���F�u��X4s���F�Sn>h�0�ӍH'�A3���nD:��fsA݈t�> �抺�T#| �9�u��� ts�[�Vy� ts�{�V�� ts���V�/��07խ*_��a��[����a�[����a.��4����0��m2���9�uu����ns_ݦ��u@7���nS��:Q7�6�űf;�p_x�O[���O	��)@�"f{��|�t���m��6� <h~����D6�|<Qg�67��N�"�����6i~��ψ4O�q%e��A���YU�x�9�i��v\I��t��;+](6?�}�z��/������ ��u�_IVeI¿�>�}�h]��޾i=�,|��/��> j���|6�T"�62��Û���օJ��F�T:�D�H�J��F�T:�0�H�J�p6ȧ���D�C%Bh�r*���-���)�ҩfgZ�-KN���#ҡ�в��K��h8��S:�(�Q7�n�L9��ܼz9�����S/G�tZ97�V���3�ʹ9�rd��V�ͩ�#3��rnN��
="�A+���ʑI���W+GU�0�ʹ9�rd����r�r,�^n�+���9��XN��
WF#�A3�rj�V�2��9�S3G�f���̭po2"4s,�fn�۲頙c95sd_u�˱�z9��r,�^�n��ϩ�[�tD:h�xN��('@3�sj���6�9�W3G����񜚹n�D��f����Q��r<�^n��D頗�9�r+\��H�ϫ��Z����95s+�"�H͜ȩ�[�>QD:h�D^��r,	'��J�*�@�H8��T:�BE\$E'{�T#<q���S�� T�ERt��N5TIѱ�z�".��c���".��c���".�cO�rE\$GǞ�䊸H��=䊸H��=䊸H��=�:�q� {�,�q� {�,�q� {*7,�"A:����H�����/��|���[�������v��_��Jn�]ꗺ'��UR�N��lk?(��./����m^~����(    �.���3�,�Z�J�3��6�*�A����z�������]��l��{y~����叢s�<����A��������5������~��?��8ӥz�'/��F��Yg�Y糂�e�&?��־o�1���!
ʝ<1�t����F�۽m��=�r�[|��B�))�?������>���osCْWхX�^Ap�<����/h�0�0`���N�_��K��lj�Wӯ^T�ۜ�0����PD^���mny�t�m(�)�+�*F��~|�����8���h��V68���h{�V68����.*�lp9�ѥ|T:X��r�K�߄�Jשq9�ѻQ��:5� g@:���zA΀t��LD:H�qq9���n�����);.� g�r��� r�X��� r%�r8~�Ed�8~�Ed�8~�Ed�8���d�u��� r�. c���,�]@Ǝ��YT�����gZ;.�g ���oQ頗���HG�=G��fǏ�^:��oT:h�p�8�^x����q�N&4s8~��D�:93.�f�0�@Ό����3�1�3�� j�-I2�3�� j6}�AK����3³����Z��48�Z��񷁢�AK���YS�1i�c�X�"{���)C̀�!�`0�P3 �h)��D�Ȁt�A_d@:�*<� G�10�-J2��p�ҩ
7��p���Fx��1�ǀt�2sG�1 �l�����H'�!7�p����	�p��<<a8��En��0�Ǣ���0�Ǣ���0��"BA d���  �h^�  ��ȂP� YddA*��,��@*��,��cT�ɵ����儫uW�@	���	��*�W���F=ǟE��7D:�QG9	?���/�U��_(�[� ���Oy�<U���v~��_t��]����R��9�i����?l�q��C��E"�>����7��7?�������殮���3 =��I:頵��ǲ��RX�t�Ak�����Z��Zk̀��2�t�Z��c��𗩤�����N5���e/ݥ�@F���d�jr- ��]�d�j�!- �^z���t�A3��e���ǂ����N�U��?f@z���t�A3��e/������N5������Ne�AF��H��� ��� d�SMn ��� d�SMn ��� d|,�2Z@��t�Q4s8��E��ha8��=�Hha8����ݲ�l,Hha8����&�BE�^"2�7����������8������ &.��κ�ˠ�B"���2��^����?W��x�0�+�pд��U���e�w��04̀t�
��04̀��c�I(�F!}��F58�\���e/��� �2�L3��ʁ�X�c��N6���L3�U'�ZP3ͦ��8f�E/|��W����^x�iDi03-{�dI����rN�t���i��Tk� I�!�1�K'�:h���S9x������SYx������S��$�D�d.�j� i0$9&s�T�� G�!�1�+���@�Crc��3T�A'���doߩ��FI��~p�Z�1I��H:h��{�;��`Hn�=��h0$7��r4c�}9	��Ǿ���Xc�A�Crc��� E�!�1ٛX���h0$6&��e��=���?����x����ҹ�w~���?4w[�j{�T��J��/uOdk��J�����~P�]^���ۼ�X��ǒSy�τ~�\k+�ΰ<*���}sQyj=ˇ�y=��ҠZ+ʵKQ-^�R�)[�����=:o޹�Vq�~���������G�wut��wt~������ǡ�z}�'/��F��Y'🧗0��O&Ͽ����a\{�o]�-�APnA���l�o��{����޶�\��M��K����hO�����>��u�����K�urL��]�n�/�0��|�\q��<N~��#�������_�
]\��n
��J]�uԓ�_������=�7?Eˋ�z.�G6��^���xn ��}�7���nZ:h�q�0
鋧z���W�A�ñ²W���Q堧ǡ�(��p�]�E����
3 ]�G����
��}�/�D���8T��襺�tp��
3 �hj� H���ހt��|T:�@����Ȥ�^GI�>�d�h�p���N5ȁ�c�e�s�1��0"��Sdp�4{�;����kT���� i��d����i�w"�#�p3d3h�p�4��;��Ҳ���U9��e� "d�p ���N�u�!�q�4�Y�!/�q�4�:��[T:d�8�f �d/<d�8�f �d�!3�q�4ҩ�C^���hx��:��8��f�N��A���Ѳ���6����h�N�"d8���}�F6��2����Q}�c����s��J�f�G3P��e4s8>Z�ҩ�uZ�qx���w���r8:�/G�� 2K8��f@:���,�8>�/G�� 2K8�Od`j���@f	����h�Y�q|"/<��2K8�Od �T#<�,�8>��T#<�,�8>���$T#<-�8>�O6n�'�~��� ����D��S�m ����D��x����DYx�Y�q|"s� 2K8�Od��Q� ����DYx�Y�q|"ҩ,<�,�8>�Ed�p���w�l���Od�ǒ����,��1j���wΗ�E�օ_�+��{�.s��|�K���Kp���|�(nЋqD431�	�z�I�_I��[��S�0��=+��SޢO��e���W��&�=$Hnҳ�J�� �M�t�6��T��)�@�c�9X~�U)�iP��w��A��c�QH�a4��L'4�8H���p)V��I6�f@z
��N:h�q�4
鋑�^
��N:h�q��쥫�E:�����d=��N'\.���H'����Ro,�a�Kq�/�t���q�1���n��^:�Wd�po�"堗���,RZ9m̀��2� ���hcx���q�1�<Hd�8ژ�T.$�pm,�b��v�,�3 �f�w]O��㪿ڟ����>ǖ��H�?o��������)]	��k[s�s�]��x��nRd�o����ָ��L4�?ǝ��0g L��8irFUy�4��XV�2$ N��8i�K'S�P&������`:��a�HOqN#�tЅ�0i����](��f��P(�@�ɤ�.GJ���P*͞e�&�q����S� N��Pi� O��Pi�N���d8�f� �f�J���9*�@��^x���Pi�g= �:h�p�4��u���Pi�)��w���Xil,�Ɖ 1"�J3 �h�D����d�/N�q"@�Gbs��:�Ɖ 9"���~Z'Z� G�#�9ٛ9�j]���d�u�4sHpN�Y'�A3��d/�l�����t�tsHp�5Ջ I"	α��%�{<<��Hr�=��p$:�#�D8����OedA�G�s��N�]���c��a"Iϱ�Ȃ0���d_�PY�&���d/�j��i"HzN��U�c4�?��E���n��\	_�� ����DM�4�d��� �����f��J�� ")�=6��?�-0!<���殮C[ )^�3��yl��xH��2QD:��╽t��H�<�@R��g� "��I��\�
��楃���xe�u����th�T )^�K���@ȋ@b�2�V����
$��"鐛H�W��ɾꠙCR��Qz9$��堕C2���rTd�$��2^��e��ח�U��h��Z|9��/G���.G��:+p&<!��=�a�@8�@�ǲ����4I�|�����4��^:���i?��t����$~,�e5���&��\:�rЄ"�cٿ��d�E�ǲ��?���P$},�i}�ˢ�E���y�A8�@�ǲ�:�t��!�c�|�A8�@�ǬYf �4I�<�+��H��>f� �i�>�}֩V�A6�@��,�A    3���Y�]��>�}��^x��!�c�g}��4��c<���sj�x��"����)��w��"���m,��	�AH�X�ҩ6N@�@����:�rP��}֩�@�@���֩V�A�@��7sT�:�AH�O�Y'�A3��d�u��$�'{�T#<�AH�O�ҩFx�"��{���"��{<<�BH��=D�$���P�c��Q(���~��2� 
E �?�K'���n����ÃD�d��cdA��@��/_��,HH�O�ҩFx)"���'7��G���&��N���:g�M�>�'�Ap���U��0����Њ� /�)���`s����@�TN3 ~%��,΀`� x��3��@�D��4�W2����@�n ��n �R {lDQ�����d��h��y
�K��nZ:�1$/�S�=锃C�2�<��H���˄r7��w:��ƀ��HO�h�N:�1 /#�S,$��:l�ˈ�'��I�K1 /#ҩ�6��"0 /#�S,$����bH^vI���eB:�(Z9�ˈ��RZ9�˄r�1N_����F�j٫�<90�W��(���/5z����$����Eu��4���� �F`�c6�o	�i�>fS�%A8����l�;$���Mu��4���� �F`�cF|Y�A�������\R:���ǌ��T�A6���ǌHOqL#�t��a�cF�M��:Ȧ��]/<h�0�1鋛G32頙�������fC3"�J9��0�1�F9��a�cF��T��������!KM#0�1�xM#0�1#Y�z�ch����j�^���_3s�_xN�u��a�c&�Neh@����L('{�A+�A��x�]����A��N�� #P0�#�:���@�揑���x(��1�u��h�"1�#Y���@��0�d�j�(��1�u�D�H�����"P$��c��(��1�t��d�H�ǈt�i��H���j,� �9�F����x��a�?&���X�%"1�#ҩ|,����T�:����Td�H<ǈt�d�H<ǈt�d�H<Ǆt2�D$�cD:��us�;Г���)W뮾�+G%)�������;�BP�`w�!��H��0#�����f���,��.� Kщ��> 3W�W��.Qo;̀�+X�`q�O��-������* �Eb^��G9_92M�'c����nZ:�1/#ґMh��A���x�H�����T\:�1/#ґ���A���x����zl�ˈtdK��t�cc ^&�cIƥ�+����d#<�b��x�N6+����4#���'ߍ����w�Erd��FV�<�����FO4�������a�;�^W�N#1�1ұM���A�������&�N#1�1#ҩ�&�N#1�1���N#1�1�8H����U��H�*�i$�?fU��i$�?fU��i$�?fU��i$�?fQ�J��?f���4�3!�֌+�?fU��i$?fdn#{�A3����N�u��a�cF�#��q頙����z�A3����N5p���Y�]�4��iZ�4C3bc�*@6���ǌH��cl���sj�������9��:h�0�1��렙�������fC�jn�>fd��J:�A�H�O��;�"<�A�H�O��ɲ�9$�'{�TĠH$�'��:���A�H�O�ҩ�@�Dr��N�� bP$����t���"��k�A�H�=�A/���آ\�4���d?�-�*'"�����V�����+�'"��k\�y"�ϱ��*�'"� k�6�D$�c��W OD":�x�D$�c��W PD":�K���b@��M��tɛ��՟�\���$�?�uX̤�\�n ��'W�W��܏a6F:QS9���-��,���Oя!M7 �~�@�n �2�������E� g@y� XA�����.��F���e!g}�xA��):����殮����^:��RT9h�q�앣;/E�����^9���:lƋBzVtΨt�a�0^����F����2 �5����F�W�uΗ�-�#35Z�B8mn��X|5z��a�@<����RTs2���8������9*\���l��P�,{�T�3���8�X��iF�P9�Aq��앓�q���ǲWNUw�p���e�����48��������48��Eu̦���,�;`6�>fM�J��>f@:���ip�1v�,됓S8�X���4ըr��)|���N&�r
3 M.�J�������ld_u��)|̦2s
3�u*� �F��c�N��r
�h��4
��������h����N5��h����N��i>f@:� �9|̦�:h�p�1�:��9|�@�J�u����c�K���A�±ǲWN����C�e?�ᑢQ頗á��X����p��;���@Q8揁Y��n(
��1�u��h��p�Y'��@/�c��:�z9�ǀt��r8�K5$�c�d�]�#E��A7�c�XT��$�c��c�A��s,�� HD��9Yx$�p���l����c`Z'�A3�#�Xd�A��s,�� HD��9�S�� HD��9Yx$�p��,<Q8r��T#|$2�=�q��r��zO�A��h��� ,�s���[�[ث�Hn�0"����Ɵ�F�Wh�H��	@@� U���v��_�`q�S� �7�9�i[ �J �q�d��~Ay�Ri2�4�F�V�,3��zk�+{��;ᠳ�a���n��j�+{���Z��]דN�Uh]N,{�K���U����p6Ra\��
=��a�@���Ʋ�����
�h5��p|�Èp���Ʋ���.��0c�'��A��AƲ���.��c��z�Aǉ�Y�4�8��5�$�([̚��~��o2Rg+fM�2g*F <����m�!�2Ne�Aތ�Ų�8���f'��p"�
�f�&���N�qз�Xb����6H,�7��}#��p4&2"4n8�X���h�9�ȘQ8��-��f F ���\T�A�Çe.��;�t������3�U�@��±�2N5���G�>�T�A߆�e?��,�z TF�a��q�A���8h�pȰ̅D�z'�W�o���Ӥ��6-,�A]��1v�_�9�m4�	H,Q8RX��h֖=�W�p���3N��������e�q��e��($�'�i�f��Y%
���\8��7$�'���9%
	��\8Ѩ�>˓��N4������d�q��}($�ǖ�|($�&k�T^�|($���B>�ic�W
I��ū����d.�j:��gc�W�
���\8�e�
I���H�
	��ū�d�D�d�q�Q�z($�Ɩ"�z 16�OgD��z !6�g��H� =�O/~v|_���K�V_���v����m����R}Tr+�R��=����*uzg[�A!|�wyqܮ>n��c]�/�b�_z>��r�5��:��cGTN훋�S�Y>4�����ʏ�Rl�ʨ얺N����}�k����]�x�<��l�~U����=��^o?���F�?��8�aR���K��ѽ~�����%������/o��v��83�[p�� ܂��'ƹ����h�t���?��g����R�/�1���c?����S��<:��1�lł?��ʃr�RT��R�=�����7y<����{�{G���m]�����]u�{�=�ܿ���\� �=g�Ob'��'t�}(��*��j�>!�ۢ�"�w�W��ǫ�p���}�t������ݽ��f�`o��z���y���:岰��?�~ _Rߩ�Z	�/������w���w��u�)�7G�Z��?*����5qQ��Uw'�{��5x/�r���1Q�H�J������=?�v�����MS��p���t�����XĽ��.�}f�&,��@�M@~n�"R5�Hل%��Ofb�3-)�P    ���EmXg`�5
��LhWoÒ.��f��W2�����N�ND):������Ē.p����4	"�E8α�>���9���T��w�ҡB�[�hJ:��[�r����'�R�A'K�Vɽe�Ƥ#ھ%K��ɽe�Ƥ#:7'K�Vʽe�Ƥ#�b�ҡ�roY|�1�T<����'��h؝,Z/���'�'Z1���'��N5ʁ�oY|�1/G��r��M)'�@+�,<єrD��d堓[��h�}q;޲�D��;���E'Zg�A܎�,:�:��v�eى��w��-O�ξ��oYx�1;C�u��-O4%ADNV:�eى��w2頕[��hL:�>�,�r˲��ld_u��-�N���ܲ�DcY����c��ݱ�7j���~rd�c3��R�ĭ��ݱ�?�s��e���R '�[�hL:�rЄ.�|4�E�*=@L��,�Ѻ�)�	�+=�&�Q�!�=S��B-��B�]�h�wt��B�{�A�,��X�M�uЅ.}4%��Ѐ^nY�)�T�;�x�E>�rT�& ��[�hL:վ	�y�E>ߩ�M@ҋ�,q͘t��d�x�2׌I�ZAi/޲�5cҩ�6��-�]3&�l��ܲ 3c��Fx��-�03fc�Fx��-13&�j��/޲3���-2���oY��u�x��̬�� �[�gf��0޲D3�,<H�񖅚Yg�A��,��:�`�e�f�Yx�-�6���� �[nf���A ��,��6�HoY��e���f��~�)�0��r-��Z<�J����ޏ�������鎷-j�n��=��h<<V~;�~����������"��<�܅a�	|�#
��W�x�k�����i���k��{���h�O����R�����9�n��mW��|�KY�d ����<�C/���T�VK	��f��ϡ{�.������k������~<|l|���j��b㩼�;��}�w~=��]wd�qB�����'t���SU�G�b�{_rҼ��[�z��odQ�8�K~r7:�o֎�g��Y�?�m���p��)~?�l��B��t �3O��C�ƥ"E�;�rq#�Q�>(�F����]��l��c7Ň��z�~���>��b��/�������E���m�ޮ��IQ�W�����> �
����K�^���)(��Ϝ^�	��:�P�)�҄~���w?�r�>L�7�vQ:z��-nW������;�)�_����͏�ǣ��6�������xLvZc�T�G��/%W�Fk:���:�ђf����I-��%�p�]T�X����v��h��?���0�1Z�4��o���H����ݎxA���nG����b�o���(�hZy����mu�*p��X5��t�~x�%���.D���'���n,K�6&�7:Y:�a�,OژtD��d�����Dic�������2��IGt�N�n,K�6%�C�QN�n,˕6&��L�n,K�6&�jriV޲lic�ӓ����MI�z�A���,_�:堗[0m�r��-K���łP+oYƴe.Vߔf�7��?��M� 92�7��_��U�]����Gu�@�,�:���e	���o���-�ȶύ�tYJ�u�����d[Wy�d.oYR�u����ee�Ȳ��eiٶ�P��-��6��#����A�,0۔t�,렙[�m,�)ڀ����e��ƲN&4s�b�����fnYp6���4>��z���W��y9za�t��-�ζn�����Jϩ���6�-��6��S�0hY��1�dY�ܲmS/|@6́fnY��m�� Z�m�b%{�A/�,H��Wݣ�=�@ˢ���X�300hY��1�T��0hY��1�T��054b��$A����NU�� C54"�j�)@>�jhD:��9C54b��Fx�����������1TC����c��Vyx��c��F,�r�|��*r�|��*r�|��*��|��ȼN��A��!Z��A��AZ��A��AZ��A��A�N6n�6��Ã<�64"��Ã@�6��8I�3ӂaҷc����w4
��%�;��6X�VVF�q��� ���j�Ty<?����vcp���i�m������Oh="���b����J���"���y�9��#\��+�XߗQ�xɓ��D�_�}=������^�v����}Q����V.U�O;��K����τ$F��֝@��r��{>���r]�`��㺻���r��t������C����)޺��r���?n|UN�6������NFOw�ʫ���n�O�������俵��͆\��:�݆�w3�ຮ����ܹ't�z�wb�a����v����8Kz����(�(��+�Y��JR����D��4�W2�o�����n[�,ߖ���O1ۼ^�ψ<sU(���P�Ʀ�
��(��#|W�H�b_&
bfvM�#Bb�n{��5�L�>F���7���ze*�?o��/���$�d��|EXO����>y������V�⏏�Ȉ@f�chnJ�����E�!m*�0�uH'67M+��
�Z�rb�r�hM!Z�(���ib�t�hMq�:�.�m��#��/#�OX��a����ɇ���"]K։����&��DFpZ:\��0��Hg{���z
[�t"{'-��S��Znlҡ��@�ud���A�V@abk1�\ʡ�� �u(�q�P��&�\ c+� �M��@�V@�aky�q�\ b+� ���Dҡ�������P��F�w��
(Dl��;Dl"�;Ô�"�
[��/�S���e��I�V���"�LK�^���2gc�ա�� �����Q��Z��&�9
۬{�9
[�t.���Q��Z�;��Sl��s���
|
�3�Nbk�δ��:���̱xȲ	(@l��uȲ	(@l�<4s ��)+[֡�� �uH�24ePx�:��wh�(8l-V�i�!�$�����"�i�!�$���i�Pߙ�BH�	h�6ҹ&/�d�0m�3-D�e�0m�s=� �&�a�4H��f�0m�sUx�	h�66���C3Gôi��Vᡛ�a���@&L@ô�c�!&�a���	�8mYx��	h�6�,<D�4P�A"a�� �0�wf���L���;3��C&L@�d�!&�����	�xgY�f��C�X�8����>U��Ѻ��58��߉����U�������]�uo��jm^�:���Gg����-R���li�^v��+�ৰ4�3���޳;'N�e�"�s������h�`��q�n\4�8�IS;���������e��&va�?��Mr�?�'�~#����2�>m2?����n��9��[,|�R�tr[ʤth�i�K��m)�ҡ���.5H'��LJ��ƻ� �ܖ2)|�R�t:�:).��x����X	��x��s=� ((�/5H'���r-xi�t��h�K���nuh�h�K��C/G�]�Z9�C��K�<��h��sxL	��.5H�2�D�]j��e�1%���T/���cJw�A:W�ǔ �R�t.�)A4ܥ��:[֑�i�Ks��4ڥ��NFH$�#3�h����HI��̅4ڥz�T�@Z:2s!�viҀGf.��.5d�K:��4ڥA�:��4ڥz�\����\H�]j�\�G^.��.*�>�r4إ�\��>4s4إz�W࡙��.5Hg�ס���.5Hg����`�����I����`��LY!%��.5�Sp�wB	i�K�\����X��s�?@JHd��ε� q !�y�^:��ā�D���:�J4ā�D�z�\�u�	��#���*<4sD�z�l�9"�G�t�
y !��^:W��@����1g�� !�c���H����1��C&HHd����!$$����	�?�xx�	��s<<d��D��92AB"��o[�	�?�x�H:tsD��)>����c����vsS�Ɲ ~�������j��K53x��K�^�8�am�� |8�ZK����B�4��k�mm�K���������fc���3��hf0�Ǡ����W��    ���(��+��;(�[��ZV������$������Jmuq���ڿ�������-U��eg�}�����V:��;I8E�+خ�;t���"����3��ԛ�T������h�!�j�����dqu�|wP�<���t^���~w��|�ج�6o_:�|Q���m�M����OW��m��ո��;��@ �[�}/O����p��p
�[!��x|�Q���ɛd���|�����,�<�B���G2N�kN2��J�<�<�@�V��}~��#�ԍUڔu��Ǉ�5w/}�n�t0���f::�S�(MJ��Ĝ����f��\���jFl���_vҽ�~}Y2.G'W���?L���F|us�;�}����M>a������<�}����C��_F�?�o���kG��ݔ�7����T�>������m����}7�k�����k�0�_~"zZ��'��@Hύ��لJ)�Ow����{������)n��S����K����-��~m:Fq���������܂�2v�|�d�gUN��/ɽ�I��2�[�:���$k�|)�{ �����
^`;��'���m�xdb���K�{ V��9��)�[ V��9��)�; T��"��~>�p��J�"=��ɹ�C�RHA%k��c�/�t�BA%k��c6�O:�����H�z�A�RHA%k��c�/�t�>��l�t��(�d�٪�rT�˥Z9
)Y�r���l���襐�I6i��K!�l�}wPҥMy1Y��6�laji2�B
 ڨ�dN�B�QȜ
)�h�&.�9R�FM\ s*� ��9��CKAD됞��E>���R�Z�;�thb)�h-�s���O:t�B���*׭�>}H�W�5�S���f撖%�u6���Q�F��/R�Z�s)�^���R�<��B��[���C/G!Dk�:�"4��B��l�9
!ڬ{�9
!Z˽�5�!^(��uH����B!��c�sH
)�h�ن;�r>�+ǵ� �B!��E:ז��@��G�{S�/R �Z�sM^ _(� B�H�Z��|���"�����E:W��|���"���C�PH�j�yᲱ�/R �Z�sUx�
)�P-ҹ��/D��d�1_��5��b�j���|!
!Ԩ��Q�FYx�� B���/DA�e�1_��5��c�j��ǀ!
"�(�CD�Q>6����M�[^!p\��O#����H��I�_����Hz�I�_����)��6��>�/�A���	��H`������B*�!�n�>+GاH9mN�\9�k%��)�M)�+��I��t�#�)�z�t���v$�6�T/��H��v$�6�T/��6_B:X/��Ӧ��s=��)�N�R��N_%OHG}-
��,騏�E!��V堕�����X&��)�S+�S��]翄�!��}�8��JM������X���§�������`���z{Ea� ����:\~��|��p��{�G�AJ�+���*R>��kƅHU��yu�\�D���ϫ�w RU$}^(���"���@��ЁR��F�;�*�>��} ҡ���uH�����\ PU�CsjAp,:!Z9
]Y�t��
	���Q��Z&�L������Е����Q(<ҕ�HH�f�B�0�^�f���L�t.���Q��Z����r���[���C/G�+k�:����Q��Z�s�$�gJ���9�{=E����kfNY��th�(pe�p�*!�9
\Yǀ�24�)�S/�6ܡ�����X9�5x��)��9�r?8?������ƴ� ?EZD\�z�\��O��ϫ�cZ���I�W/��lC��H��.�qUx�O������%�C/G��yᲱ��I�S3���S	����A�s=�!/�"�����lyA��XHӰ�� s|,b�D���̱M�I$�>�f���#�H$}^���G$�H���9.�H"��95sl�D"�sj��,<"�D���̱�9h��s|l%�py����薊��xsэ��������tz��Z�5��z��P��v;KU�zq������n��[�F�b��-�6�j��C�j׉/�5;���Ű>�x�-z'���Ε{~�׊>��R�d��q�Ú�^[���^ݼ8Z>l�[���������ح�k{�O���ǭ3qu��}�£P��x�����룫8�/o� �3���w֋�z��DA�a��_1�v4�;7�����Q�Iڭ�)E���n|��u�7�Q&?]?�'�Н���ن]P��B��e�$�m�&���Ѓ��	�S��?oE���()��$�W2��&!G��C~ބ!_��z��+�7a�|�&n�}�6aȗ��i3��㝂�Xҗyr0;$�˱x����[,�|">M��.?�t���4��s,a�]>���^z�	N>����i����]>���\������l��4�҉�t�fK䧩���pC����f���x�2�t�fK�$�9"@M�t�[Af�E䧙�z9">�����i�x����ϫ��2�1I�S+�f�b&�>�V���#�L$}^���G��H��Z9�
�3��y�r\!f"�sj�<��C/G��ha&R�k^�7�r|�'�9">M��������\z�6࡙#������i��&�9">͜{!f"�f�~�� �r���4����#�L$�׼���3�"���K�Z�E��H���9��"�|H�S3�w�C3Għ4࡙#�ӔKٲ��f�cz9"=M�r�k�c�	��� ���>�����i�<�����E�s�?@�� b��x��3Dn���:�J4��"�H�t��:��"�H�t�
�̜ ���Kg����	"�H�t�
�ܜ ���K��g"��"�7��Ă"�H�t6� �.2��C0� �����"��"s<<�"H�t�
��d���`A� ���!D!@�+<���`A� ���T�%$�"H�t�
/!D!@�xx� �Lu4�KG��Z���h�(�^k������$���k}�u4�
,�Yl���6�KK���j����������n�bp�}~Z��WK����v4��W������vSW���A�G+X�?���2�_}m��I��r㬟���������n����a{�n���֮�6w�g=��엃/�Qt�(��'����۟��������3G~Uf��F�6�5�N��v��˥�����Ý�u���~y��?>���rrw�s�����Z�����x\;n ���t�'W��wQ�%W������]����J���km��|�r��</Z/�ppq�W��Y���z�������H%
�S���v�g5R�?]?��'M$��fx�E����������l���4Ry_�T�H�s��$'�8�����|���i������3���L2��J�j��uB����]����I#�D
�Y�o��t���;���8��_��O��>Z�A<h)�b�k*z�ۮ���V躖��m������o��㡃爄з�xX¶�3!.�|�n�tn��ĕ��t8G��3�H'����
8S�t��@Z:\�3�H'����
8�G�7���ݽ�t��Og��:��hZ:\�3�Hg{��
8S�t�nZ:\�3͒����C:׭�C��4J9�rn�Qʡ��`3�2�7$(�L~���Cސ�`3�2�7$(�L�<�	
7S�C���Cސ��3�2�8$(�L-�6.�C���r�se��i����!A�fj�Չg��ҡ��p3����W��ҡ��p3ud�� -�9
7Ӭ����%�lҡ��p3�d��^�f���4�����e�s-˥`?���˱��)��D:����Ζ���C���9��:��
7S�t��:��
7�,���Q��:�S�P��C3G�f�(sl�:�rl��u
������r�?@���`3�H���TAA�iY����TAA�i�ε� �2��L��X�Z��TAA�i��5[�XAA�i��U�!WFP�iZ�sUx�d��l�9
2M�t    ���C7GA�5{�`AA���!XFP�iZ,W��`Aa���!XFP�iZ�sUx�j��\�e��f���dA����!YFP�iFyxH�j�Q�e����ȲUx��(�4-Yg����T'�8�,�D��Չa���Đj�q��(��l�9Ҿ�ݞ�*͛��å���I�`�<��z��[�	�P����������IW�6SW���%^hy��ܾo5Ğj�Ǽ��n
��gY+�d���A���>K���stߍ���{߻y������_�G��~e4�R��ɹ����n$�h[i[��g��h�x!8W���-!���T��$��$��d�_�["_��I�_��zK�<�%�}���ȗ<o��QD=Kڙ�=�9���n�0�X�����ἅ��!=��˧N[(,P�s��|�ᬅ��Q�ͻ9b�I��

TG�E��H�I��

T���3���5h

T�����J���"���J���"=��L>�p��5K:�r��\U#�((P�u�"���#�l5Z9
�$���I�I��(P-ŝ˾c|j�}��$
�(���I�Q��(P��;�'Q8�Z�[֑������x[,�r��$�e��IGVNR0�Z��x�"�t��$�e��v�#3')P�<2s���Q�%�tғ$jҽnCz��`@�H�R����P@�T9&o[��I
Ԥo[��Q(�Z�3-��4s
��l�9
Ԭ{�9
T�c�m�C3G��j���e�9
Tǀ�24�r")Pʹ�;��H
T��c�}�!�DR�Z�3m?�r"�@#��6��BN$h�^:��BN$h�^:�B�!'�4R/����h�^:[��^�4R/���C/G����Cʉ$��K��s"�@#�ҹ&/�s"�@#c,<ĜH"��1'�42��C̉$�̱�s"�H#s,<ĜH"��1'��42��C̉$"�̱�s"�H#s,<�H"��9'��42��'8'S��/�ҝA6ʵ��-������R�d��q�Ú��3�n�����������ݸ����͵õf{q�ڹY��w������dw��]������
��ovk��+��'�����M=�9�p�)����Y�.����� 4'��Q����g��~%�^�������g g/�|H��Iįd����9zx9�� �|ڌ~���G��'��Xz���K�.���c����ވ,!�|"�N}���>K� I�ک�:�YB:t�D������%�C�O��)��\mB:\�%r��K��P��-�k�^:��p$�k�^:��tB:\�%����l�\:ۭ��kg�r��X;円K9��H"�N���2�#�T;s<��H"�N�t.�7�H�3��C��$b��1�#�X;s<��H"���7���S��ez9"��/�7�H�S���sI��I�ک�N'b$�C3G��)��0uB:4sD����6࡙#R�K��>!�9"�N}���uh�T;cf�~#�P;����C��$B��Kg�:�rD��z�\��4sD��9>j��>�f��^OR>����ۀO�I>�ϩ���5!�9"�Θ)+$�H"�N�:�x�^�ȴSoc�� D�v�s�?@&�$��/Tp�?@&�$��g�k�2A$����ε� ���Q/�k�� ���Q/���C&�$��K��	"���ҹ*<��H"�G�t�
� ���1g�� ���1��C.�$����"�  �F���C7G$ ��:W��`ID ���!D@�xx�D�9�A$d���`"H�2<W��d"H�t�
��^:S�w0-�V�
�g�v&�7O�N�X:��6�A:��%��
o�(@���\R:��6��A:��%��
o�(@���\R:��6��^:�e��t4_�i ��;�I�h�n�(@��=��|ݦQ�4H'/P%�C^�M� �$�9��R/��V�� �F2H9�r4�Aʡ��1�2�`�@xH�i �<��4�A�l� i6�d���� �F2��CZ�M� i��ٲ��d���� ��0�� �ҡ��A�4H'�%��6�6���^:��GR:�r4<��\�:l�m���s-Sذ����s��T��sZ���u8g��1L�p�J�cpH�z����dR:�����9�-٦�148x����4:�3ǵ2�%�4:��\+s�[�M댮A:���l�:�k�ε2�%۴���\k4�[�M댮A:לvK�i��5Hg�����:�k��Vᡙ�uF� ���C7G댮����MJ�n��]}��f/�a�M�n����mZgt�<<l�l�Z���a�d��� &۴��yx�0٦5G7��Æ�6�9�A6L�i����a�Mk�n����mZst�<<�lӚ�k��U���ȵ�xg!׺�r5�\{6��R��A}X��f�>�ȵ������}ڨ�;N���t�tݮ�nz�뵗��¶X��{�i���?Ir���Vr�E�-8�#�7p�����q�%
�����z�"�f�j�|z���t�����w*+�Ng�������`gsp���J����{1����E[Ƒ�{*;�SW��O��	0u�����.��H�u�[�幮�}�`�,��sh������@�f���� �@��'k��|��f�W2�hp������K�e�S��w
�� ȓ�ٝ��c�����[,�2hl��s��|��$��&Q�<��̧�1hh��E��\�a#o��&��� �/���c�DC�s�"�W�ih�s�јO:\1��I4H�z��N�6M�Az�U�|��1�Mb�t��hl����A+GC�hp�\ʡ���I�+g�q����$��w��ۦqI̱ﰉ�MÒd�ao��%� �˾�&�6�Kb�}�M�m�� �x�4.�A3��ۦqI4�6���Ѹ$��x�-�r��hX�3lҡ��aI4H��G.鰇�MÒ���V�=�m�DC��𰇷MÒh�:�th�hXYg�ס��aI4H�R��J�ae�����6�JbR��^�F%� �k)6�f�F%1��C3G��h��t��4s4*�9ޅ��m�DÔ�-���Ѩ$�3w�AI�+g���ј$����Ә$�3m?��Y?�I���2m?��Y�Cd���1M^\ج�!2I�KgZ�wa�~��$Q/�����;D&�z�\6�w�L�ҹ*<����$�m,W����"�D�t�
��;D&�9�د�!2I���]�CD��c�a�~��$1���v�J����V࡙#RI̱�]�C���c�a�~�H%1���v��Jb�����"����;D*�9>VB3G���3{����T/�X9K/�֬%{X�~����e�h�D�Y�k�;�eоy������Ao}���_�U+�{��f��q}׾[۫�O���[����>�2p�a�?���v�_��S��_o|MΆ2(�vA����o�D���3��L��j�RF���������c��w�o������}�l�y���[�z�\����l�5��~AXVAe��1�_V�
-���30}E�� d`��������F9�Qk��<8-�ګ��xxX���o�=l.zk�ष�r;�����mq'������/D(� .~V�E�˶;+��+���(��)��A��I��_��9J��ݭ��e�Z^�,�>4���j�>mno^V���o+���p�/��B�����~�"
V3~��(�g��F��o5��G���ƭ�8:x�qV��+��l��6������zų[yï�	�0z�FOXϵ%���qP+�Q��g��<�������A�VNk�+���}Pk���h->��W�������p�tܞm.����|s�>:��
��:�St���\Ƿ�{��q��>}Ew��i����qoj动�k����[2��$�8=5v��݃�a��z~�i�w6�O��v�_:׏�;���&�o���A'Ϟ��S|��ʸ�D5EJ?����>]�F�wy��l���V2�/�a[��e�    �֏�_�8�am����<�V��µڰY��:��]�K�����M�<WO��t����B��)����̦�ǉ?��v��8�
>G��7��ܷ�;Y���ȯ�.ȥ��^;=Z8>\���wW�e`���/��/+���}�,�f�~�#?�W���+m�y�����+����Mo���ݛD3�t�=Ʉz�Zr60��������Y�u�[>B�?��1�����}��2�6S�2+G����r�?��2��g�F�����)*O�2����^�+x3g�-�I
���~�������z�|��b�p3gf�.��Y�!�ʙ�E�K:�Er�t��33�V�tJ��L�p3Gκ��K:�Er�t��#g���$���ϔ7s�[x��S(����f��uO�t��Y9r�-<]�)p�L��՜����I�nnf�&�l�:4s3�S1V���mӔC+73o�4)V�̼m�<�X93�M3�b����6��C��33p�4)V���m�<�X93�M3�b����u��ez���ۆ9�rf�m�)��t����I>�������%���˔��̼mM����̼m�<4s3�ue�M:4s3󶍻ס�����I:ۭ��̸m]���CX�33n۸��̸m]ҹc!-ș�mZ��� gfܶi�:�93㶍���͌��4oٲ��̸mæ���L�ֵN�6ޡ�����ku�k�҂��iۺ�s�?@\�33�S�t���rf�}�ε� �A�̼OM���hHrf~��5[�� gf�.�\�������sUxHrf~��U�!1ș��K:[��nnf�i�Hrf~���!2ș�i���� gf�i"������yx�rff~���!2ș�i���� gf�i"������yx�rf�~���!3ș��i���� gf�i>���'�=�MyXa�v,K8Yʓ�����SM��20�8IS9ɀ��|u���2��s����@�#�y2�J�ؿ�������ϑ�����B|���g�� {lڤ2uI���W��HRz厥O�[,z��Ú�S��f*�{f��&�v��ʡÞ�=�I���LMK�损��IXzG�&��^���������߯��6-��E��PZ�����U����P��������o������̌d])�t���p&03#Y�t
�"S:�	��H�%�N͔�ugf$�����33�uI� I��c��̐d�C�93$Y�t�*��S33�5)��1ojfD��y�rh9g&$6�����ɆM30mjf>�YӌH:4r3�M��653 �4��iS3�M��653!�4��iS3�u=�ٲ���;3!Y���!�S���;3 �M�7�B٤#+��H�%�BW˔���;3 Y�t�v�#3��H6n�#3��H֕u6��̹3���ב�sg$�Τ�F^Ν���ke�����˹3�uI�*�6�r3�uI�Z�������K:W������lܽ��̀d�<4s3�5=�l��C373 Y�t.C�!��|dM�ن;�r3�uY9��qg�#뚻p��Cp�K$��:����DR���sM^ 8�%�r�K�*��I9ꥳ�9�判����u�判�^���C/G$娗�V栙#�r�1s�A9�9Hq��sD��DP�9>�C\")�3�!.��^:�[�Y9�9�q��s,<D��DV�9>�C\"+��!.��c�������1��Cv�Kd嘳�b�L�<��Ϥ\XE[� ��0K��q��?���c�v��q�<�����1�3�4��������������c�S�����|Hz�I�_��W����@�r��.L�ñ�|)��4��?^�����m������[|�������ZE����G�]�h�[Z��)�����'�N;G����߷�����ڻ-e�~��-}�Nh�1��}��K��)w�t8I�A�4[r���t8I�A�4H'w�JJ��tLÀ'w�JJ��tL�t:K4!2i\tL�t2�").�Ҡc��u:K4).�Ҡc����&��%_u�$�ЎҨcꥳ����Ѡc)�^��3H9�r4�Ai\rL�t.�4.9�A:���D���0w�2�H�Ҙc�\i\sL�t�
�4.�9�a��e�!�ƥ1�4�9��C/Gc���h �ƥ!�4��d~lR:4s4��d\AR:4s4�z�tVtR:4s4�Ai\rLC�٤C3GC�t�C �KC���l�<�F�0޹<�Ѹ4�A�h\qL�t��Xȣqi�1�
<4s4�I�:4s4�I�9qL������,�OX>���&+S��!�ĥ�4�S0�w�O\pL��e��!�ĥ�4Hg��!�ĥ�~4Hg��!Rĥ�~4Hg��!Rĥ�~4<֙V�}�qi�ҙf�>D��4���l�9CG�t�
�".���A:W��H���� ���C��Kc託�6{�P�����^���T���1��C��K����!WĥQt��+��0:yx�qi�KlrE\H� �".�c���\��1��c����^��,B���S`�ɉ跤�z"Z��E5�����+@��+�T��$M�$��d����ї��� v�����Ϻ$2��������t��#GW�@|��vH� {lڤ2�x���~ʹ�
0��b��c{4��tegrґ��h@/Y�����!�ţ�4H����t�=�K�t��JHGۣ��K�����t�=�K�t�	�h�ԣ�4H�z�AދGzi�N_'OHG+���e�t��<�K�t�[�9�� ����x^�(�����2��C܋G�yi��e�!�ţ�4H�2����p^�sx�{�h</���<Ľx4���lZ9�� q/�a�Ζu��h@/��r4���[�~�t�{�h</�:}�?!�9�K����LH�f���Ґu����!�lҡ���4�9�{�9�˔g��|���~҅;���?�Ԇ;��/x�o9��zM�p����/~s��i��o����q�1R#��]�G�Lit2w/�|�k<�̤�t�4:��\Kː]���d�k6��
�k<�̠{=Ů��>�֔k���1��Ԛ���MB:��4:�)&%R�)N�aՅm�CgJ��i��q��@ƈG��i�ε�#�
�^:�n
d�xD��z�\�)�1��:��\��1��:�s�=@ƈG�ꨗ�U�!c�#Bu�K��1��:�sUx��P�ҹ*<��xD��9�H�Ps<<ČxD��9bF<"U�1#�c�������1��C̈G����!f�#ru���3��:�xx��\s<<ČxD��9rF<"WG��[����.o�xd��?>�\t�#���k��+�^��Vm��ޫ>T����Rի^���.�������V�ѯص~{Pkv^jË��ծ_����/�4ʥacg�;ٯ_v����V���A�Y�~��4�m�zm��;o{ɿ���^����a��uu��X;�z�j�[�j�ow�����-�s~��xx}t'���M��o������zQ\oG�	DA�a���;�b��h�?vn�����S�i���*
Y�VA�2��_&�?uE� ?�
�k���~奞#�����My��tS:���V����V�Z]~�w�Vn^v�_6��?l�~����,[H�8�!
~��z9k�W���_�d��z�;"��}P��_W������]c벿5X�/,܈��svZ��ҕ��|���9�NQXG����M�(�)�˸+�?n:0[�u��Vp�r¬�k�V�]��NAg��3�ԇ��3������HZ�Iįd�ޙĵx:����st&ɗ��c��+�Ag���3I��0y;��K���ֲ���Ǘ��4~�d�����sL���w��Ù�*� ��˥Nt�TA��,[s)��"TP�r�c�>�t�jM�
����}�|��5*�^z�E�|��5*�^z�J�H ��#B�Kgz�������m"�"^>�p՚HT�u6�����ʥ3U� "x<"TP�r�"��)�\9[��V��4��������� �w    <"QP�r�9[ �;(h�} ~�#�����xD��9��w<"Q���;�(��ΰe:9"QP��o�S�(�~��&Z9"PP����u�|ҡ�#����nu��@A�Yg������3)����4�V����T�s�w��<A�ҹ<��xD��9>ߙH'��K�Z�MQo>���߽��'hн��'����xh�<A�SV��C3G�	*���h0先T��k�c��&���r-Dc��&�^:����1^�m\[N��1^�sMY!��'b��K�Z������R/��ن��O�x���Vᑗ�/���*<�r>���rUx�y�/�ҹ*<��D��9��y�/�SV.1/>��e�������2��C̋O�x�c�!��'������A^��^ ��'��ԯIrYx�y� /s,<��D��9>r^|"��9/>�e��-�y�%�M�W�v�e�}�8ٿ��8}���9�ӿ[&������T��$M�$ίd���%�q�|r�ϗ����d���|u���2��s���y�q�|)��6��>�-�����b���M}�X:��D��z���i	��c����{�%�C�M
��N��Y:��D��z���i	��c��ʥ����=6(�^:ے�WL�@A�ҹn�X����ӻ]'��S"�� ���|ʥ�����|�(�^�H�3G9�rD �9�j|"��q5>�g������3��C\�O$�c�!��'�L1�������
�Uju�j�q�x�D�~���H��
��vQq�a߳��tt-�O?�ZP"9М����Dr����G f�'��qb�������;���M(�\��知CʎO��:����M(h΀���T?�٤CJ4�	%��y�AȎO���\3���@��m�����s-"����xh��@s����C���9���|H�53���?��&�C3G�*��U�!G�'b�+�8!z9"6P����ҡ�#b�K��7�$��Q/�k��D|"8G���k��D|"9G�c�k%�D|":G�t��zI">��^:S�!I�'�s�����ҡ�#�s�g���$��9�3U��D|":G�t��KY">��~���Ç&��9�-[��n���Q/���C7G�稗�Vᡛ#�s���!ĉ�Dz�1>�8���1��C��O����!N�'�s�K��'��9�xx���s<|�'�py��ã�����7����������J���U[ê�����m��T�����Kka!�趽��k�+v��Ԛ�6�=T�v����ϯ�~�Q���u�;ٯ_v����V���A�Y�~��4�m�zm:O���yqOZC���:{岳�Y�Z{Z?���5�G/�ы����-�s~��xx}t'���M��o������zQ\oG�	DA�a���;�b��h�?vn�������i���*
�(��%�^֔��O]�G�\����VF�[���~}X��o�և�t�j�[���j���.����ӽa%���ׇ�Է���Vnw���z���:ױ�����c��8�
��~�"+������oԯz�u��=�-��<.?��W��}c�~��(����wa��ȗ�ж
�/��d���+���(�6[�@fߩ�R�����_�8�am4�w�+�ͥ�׽gٻ�]VO�����^�<�K��N���z�u����=�ҋ��?O2k��Q�S`�I�q����vRF�E_;|�`|�0�_���t��$'�����4��8�؅��>?j ��@r�3�@�+������K�@|���5�I� ϵH���ۅ�Em8w`��[,εh�F��3�t8ע�5H'ϰ����9�ݨA:y���W�i�F�߼�D�a'�Õs�Q}���G����9�ݨA:�%��t���i�Fҹn��������F����9�h�t��h�F���nuh�h�F��C/GC7�Z9�� �i?4r�A�~h�F�<���ȍ�sxL���2��Cc7d�1��n4��c��ݨ�^g�:�r��h�������n�0��go�ґ�h�F��S��
I���4t������'�#3�Ѝ&xd��QCֹ�C�O@C7j�:׽i?�hγ�~�Q�x�r�)�χ�9�rl>EٙH��5H�Z�M�m>�ϩ��+����Ѝ��߽��hҀ�f��nT/�~1)�9�ќ�:��4r��u
���2�ܨ��r�?@�L@#7j�ε� �2��A:����4d��\��*Аi�\+ѐ*Аi�s��!V&�!�4Hg����ѐi��Uxh�h�4��
�2��!�\�e2͠��4d�A�e2� �2��f������M3��C@K@����!�%�Q����ШiyxHh	h�4�<<$�4j�AZ5M�t�
	-�>f��OZ�:��������(���m����#�N�_�\������SE������-��du%|�����{��z����vvXtDA�o��v�W��O���i���x�۱��,H��� ���AG�����CTu4��Q����g �~%?�h x:������A2Iw=ɀ�����A���`�LCYG�d
��'��㏷�=�U��Av���-�]>�@�A:��&�C�OCPj�N��	����ҿ9�O��I������N��I�������D%��5[�R�t��6I�p͖��� ����=A�A:y�")����&I�n�ƠT/��V�f���4H9�r4�)��{��I�V��4��Gҡ��(5H�1�th�h JsI�V�F�4��Gҡ��(�1�th�hJc|$Z9�RC�c�:�r4�A�z9�R}���NH�ܞ���p��߹HJ�f��T/�~�5)�9�RC��<4s4 ����I�f��4�^�f��4��&����'5�w./����'M*��������,�Fҡ���'*�)\ˇ�95sl�z���!}^�׀OJ>�����z�B?����?i�crA~R�:�x�^����`c�� $��'5H���\��� � �k�rAH�t���	h �u��h�	h ҹf��@�sUx�	h ҹ*<�4��\�AH�����JJ�n�� R�u��D�4�A�A� � d���h��F2��C4H@� ��!$�a����0@yx�	h �<<F��0@yx��a���B� i��V�?���������i4�:n��}G���n��^^_��,�o�N]\oܸgC�i?�?���_\�<�8������E[\Gz^vC����'���,��P�l�N��8t��v֠�B�^4+�Y��3��������L�(�@��N2`�J�U�re Ej�d������A���`�ȁ��A�`�O��G�|a�n�'�?��FK�X:��!�^zǓO9��!�^yÓO9r�!��^����A>���4��9f���#��8p��X��'�׆4���7(D����IG�!��!�l�6�^�8p��X��%cB�$��˅4�z�\cBN���R��^9W�����F�3ǾCZLH���c�!,&�1�2r�p�\ ,&�A���@XLH��i���d�����3ȾCXLH��i�3lY�N��S/=ǛU��C'Gc�i���I�V�ƀ�p��x� �t��h8s6�[�9NC��<4s4����I�f�ƀ3�^�f�ƀ� �I9Dń4������!*&�!�*��p�s-����p���C���9�{�9Τ��a�ʖuh�h8�ҹ$��4�z�l�Z9 N����}�@���ӰN��� � !����sm?@ HH�����5y�@���Q/�k!AB"�G�t�g��D��z�lz9"�G�t�
����ƲUxh�����*<tsD��1�� !�c��	�?�Xx� !��^:S�	�?�Xx� !�c��    	�?�Xx� !�c��	�?�Xx� !�c���	�?�Xx� !�c��	&�T'�x��t2p�NF'�3����dP�d��z�;"�d���S8��t�vq�w�rv���W�i\8�lus�x���p����|t27c����.���ڶ�}|7��+��'����[����SV!��6�R�η<ו������^nv�be 6�	������	�@�I��WK���W��^R�d�y�2��U]r���f��W2����/x~C[�`���ޓ���!���7D���ʗ���S�7D��r�9,~>�pvCdߩ��������}�^:דBrB"�N������õj"�N��/��ת��;�ҹm��w��؜�'�U�wI�^��S.���A+Gd�)W�V䠕#��+g�q���w��wH�	��;c�;�D�9�rB"���9!|g�}�����3ǾC@NHߙc�! '$������C'G�)����[>����w��;�th��;��yNv���{�~��u�C>NH�ޙ3�!'$r��g�M:4sD���s���o���c!$&$��*s���o�s-H:���o�9hi��7��uhi��7s|
K�!}N-M��@��CKC��)��\�uL!�ߔ'�m���)"�M���Z��8"�M�t�Ex�!���w�Ex��-"�G�t�Ex���ϫ��Z�E8�H��z9�g�r��y�r\�@"�s�����'x�H��.O�9�O:0s��95syB��\$}N���A"�s��,<"�D���̱Yx��-"���� ��y5sl�9"���� ��y5s\!A"��j�,<B�D���̱Yx��Ϟϩt�
�� ��y5s\1A"�sj��,|�	2�� N:G/��A�\��ep��vR�^j����;N}X�2�����쾞^u��m��;A�ktwϯOW�p��Ჾ�X��;|�2p�����):�Z�^N:��+��'���4�۰��4�[��o���u��������o+�e�1�2��{8���Q�����d ����N���@�]�3Z���׉�|)�.�6�w��U���O����XƁ�'�-��`1�ED�������]>��^z�%�|ҡ�'2��K�1��'�|"N���|ҡ�'2������c��O:\�%2��g��1��'��pꥳ=���-��^z��)�I�k�D�Aҡ�#B��K��-ƶ�8s�C/GD���Z9"��X1��y�r\�b"�f�4xĊ��ϩ�c3��I�W+�e�+&�>�V���C+Gd��c�+&��kV�LY��c[D�)�F"VL�|N�����c>���p��x�$�th�8����gЀ�f���S�u6���p�Wc��uh�8s�m��	p��;���I��e9��P1�ED���δ+4sD�9>j��>�f��^OqB>�ϫ�c���p��![֡�#"��y�#.F�|N�<���� �~�´� #�>�f�g����I�S3�3�?HDư-"G�t������y5sL+��1"��j�f눌I�W3�U�#�>�+sW�Gd�H�������C7G�ਗ�Vᡛ#Rp�Kg�� 8F$}N���Gt�H���9�
���E�����#�>�n���#<F$}N���Gx�H���9.����yus\�1"�����*<tsD�9�1"�s���<<�cD���ͱy�c��A�����K}XKv4x��Kv�5��`P�d��z�;��w�O7�����/������@x��_q�Nv�KG���r�&����>:����h��S�;����vSWD�O:&��Ǉ�gv~Q/�t�9�����������!GG��c*Fq��v��+�AG���A�#9;��@�]O2`�J~�� ��h���e�h�/���f��Ǉ�\+̓BCz߲��K�.��Cc���<�wWB94�D���[w%�C�O��)W��iB:��D�z���]	���ih�ӻ�&��["M�t:�t�������s=�0&�N�ϫ�No���Wl� 8��C/G�)��U�1ƶ�8�V���A+G��)�9[��V�H�S��˾c\g�}Ǵ"���i1D�9��b�8s�;��)p��wL�!R�̱�C����3lYGNN)pʳN��&�#''�8��M:�r��S/�N�HHG^N!p��ll�:2s��S^��<2s��S�u.�#�8s�uH�D�z�\ʑ�D������!,F!p�x�D���X}B:4sD�A�9"Π{�9"N�t����=��C3G��)��eh Dpʕsw�D�z+ǵ� � ���S/�k�"A����sm?@$� ��K皼@$� ��K�Z��HA������l�^���Q/���C/G������Ux����6���C&� ��K��
"��s&/�
"��c,<��"�G��W��PA���c�!D�?�XxD �9BA d���PA �c�!D@�XxBA �^:S��!D@�XxRA d���T��^�b�e�Zo^d�2������V��y�p_��8�uW�z��q$�qӽ�^������m��<���������D8�=7A/��+��; ��F�,�wj峌�w��T�_j�(��S�F�om��j��+�-n�{��㕭����b�����|��v}��
_X��;z��zE'(�MP�fv�"~��Nя���tϻ~���uC�˺��K8I�9D�����d���Dv���H�I�_��I�F�?o$�/I?ɀ�+�A#	��������H"_
�<���|P�J�:yr@�'����n�t8Ϡ�4H'�LKH��AC�i�N��4���iI�p�AC�i�N�W�i>���dݤt�jLC�i�Nƶ$��Uc�O�t��$��O�tr��t�jLc�$�9�O�t�[�9���W#h>��C+G�d�!�F� |�x7�l3y� �w4m���Rui��g���l��:R�eT���Yq(�\�����������Ϻ�O�!UG�8��3 UG�8��3 UG�@��3 UG�@��3 UG�@��3 UG�@��u��C�I�c� TG�8��;���='��!����dd�ҡ�q�g�xOJ�f��	4i�C3G�j�:�th�h�@Yg�ס��qz�A/G�j�\2uhR��^��	� �k�8E���>�f����P2��t��^O1\>�ϫ�c����0��-<�����h�c�S��a��m�C/G�j��\�$�"h�@ҹ�s��A#Di�ε� �)�F�� �k��S��ε�)�ƈR�X���ҡ��1�4d���Cx��1�4H��"h�(ҹ*<ħ#J�t�
���^:��T�e���AcD��!AE� QyxHP4J���F�
	*���2��C���q���"h�(ҹ<<&��@Qyx�P������BEi���Ux��h�(�<|�2�x!~��4^h�kY�����]/����F��wP:�X����Ã�%ww�\n<ւ�F�f�>���/w�p�����[����b��8�I?99t�v��z�<,Z�`9��j���x!ϡ�<������M_�ce Œ�d ����/��@�]O2�J~�x!O��|���m��/���f���G�Nh��������w��#�/i�@����ݒʑɗ4X�z���nI���K+P�r:8)y|Icj�Nn�<���5H'whNJG+���
� �KJG+���
��M�f�GD�H+PC�ɍ���ъ���M�������K�r�#i�@.�K9�r4T�z�l5Z9)���:�
4ǾC���q���#i�@��;��H(� ��:�F
4ȾC����5H�z�A����5���C'G#������I����@��;�th�h�@�ɔ��t��h�@s6�[�9(Ф��!�lҡ���͹��Ց4P��\ʡ��q5�w&�@�����)����A:�R�cA3G�    S��Q�C����o��l�:4s4P�I�9(PÔ�-����@�ꥳ��h�@�ʹ�;$�H&P��c�}p �D�0��3m?8�\"��"��6���K$�R����5y��I���δ�@r�$R��K�z�Ar�$R��Kg����)EꥳUx�刔"�6���C3G����U�!�D)E�L^ �D)E�Xx�.�DH�9BA$�R���X�� ��)R�l�*�
"��"s,<��H"��� � 2��C(�$�̱�
"�  s,<��H" �� � 2��'� S��gK/��oe�28����{؞l?V���������җ~�|�������p��Ilo�]��NnƝ~��AX�^AJ7t@+�����(�6O����Z��}�4�������N}0|��/�_.۷���w}�-�z��-�'�ݭ3�t���ˡ�(��]�g	7+���q�~�~��'�g��O�E�)X�z��A�m$\�6��U����8I[=ɀ�����H�3�t���_�����D:x�AXLy���Ds/W+}m$>�X:�eP�{:�'i�p�A���PN�c��CX����t(��CKK�s
~�G�7k��9FR��x��s����)����Q�B���%�����ɽ����}�{�~���]T�{7�[���~�,9�\���[�>Gz��%o
?P�t�k�i�pɛ��"���q;���"�������) A��C3J�xD�U9�E)�@-6�K9��|��\5�v$�h���v$h���v$�h���v$��E:��Á�I�e�!iGR��F�wHڑx��	7ۣ9
<P��a�:trx����i���Q؁Z�;�tڑv��*G|W'-z9
;P�t�1�th�(�@-Yg���Q؁Z��&�9
;Ь{�9
;P�t.���QЁZ�;����IA�Uࡗ���H�Z�MQn>���[�O�e>�ϩ�c��S\���j�<�H
:P��z�,-�9
:PGֹ�Pȁ:��wh�(�@-V�k��T(�@-ҹ�0O���R߹� OŦ@��H皼@��M�Fi��u�C��M�Fi��u�C��M�FiY���!OŦ`��H��!PŦ`��H粱��bS�Q&�9HT�)�(��D��j�Qf2Ul
5�(3�*6e���L��"���T�)�(-��r-T@��M!Ge�!SŦ�����bS�QFYxU�)�(�,<���t�Y�9
:J�t�
���M5c�� O3�F��Ռ���~ߌ����5�pn��N/�N�g��z��\n�.���C�a�٬]v�^��?�݌�.
�`��w3a�OW��P�]��7��a����(�^�&$k�+���}����.Vv���+��J�y#|y<�w������R��usq�uf��YQw"k�?��
����.s���M���脅���z��h��tE��~v2\�߷U��V�w��R��R����Fu��g�ToVK+�?�ʟ�V�]�jU7F_�sy8:9������J��z�)чlo4v���6��?���N�V��������h��Ǉ�ѧ����+��vV
�r�PY�����й�ݎ�����:Z*��[�n�d8���Q��pZB}��}X����Vj��Fa�Q{����,J�8h���R=��Qն���{k�Q�W:�/>u4u�C_��;n���x��;tz���g~
�[���e�k�R=NJ����ga�����7�Ǒ�7A^�Ňr��?%�¨��G,����g���2��s�t�x?����V����2_2�d�Ei�l���Y����q�����Dě�?���������G��W�����N��N��9O+��xs[:a���}%��<�7��T�?�_M,}ϋ�Q��_��r�Y��[Uɭ�g�R/���S�޲�}us����[p-����L_>���'�sW���-��ߝ"� ��Y�V�K��ΟZ��e'#E��o�ʔ��W!��F���G�X��
+3K��g��Ԋ~�\��OF����׽"��ʂm{�c�,+��������4�j�Y��l����?.�������9��t�Q�d����%�'_?��wU3��EPp<!�\U�n�߻�w�[�|�vc��@ۍ�L�j�j����+wZ�|�6+���v���r�K��(5�(���F�zn-�+���O�|ܮl�v�3��~�KE%�Z��[�Q*�ۅ?K�����ri�������x�=<�?�~��rc����3��g�R��0zjG��Q��{��>]�Gw[v�}����q�tōstݻ�;�:7}׎>*��?K�j�p��:�e��ʧ�������֪����(�k�z�%F=�\���jT(�����G�ӣˇ�����`%���_ZV�����������|X��@0���Tq�}�u��v�-'�~���۱��L-�;V���\�m4[��,ٵ�/�V.������bw�/�������;?|�.���f5��m����V�ˉ�?ˉB�+������i;����r�%�VS��J����Y�ۓ=x���,�'S�wt�q=��ǋ�[/��
zePk�D:�S��ǽۧ���k����Qn?�V֪��b�u��xP�����>��2ZH�_����[t����Y�����-��:
;��㖪߮^��t����P�>������=y*t;����a�*�f�Pd��0*^������i��H���XE��;��~�����>1��͸�e�ƈ�0�>�/��e�^�֟��W�G�-�&��k�vt�I���y�#��.�~h���N���0%����{ڻ��0G�cS���f�+�)�>�C۷♖�P��Q|6l���A��r�d��G��t����p��NnO:���ˇ���n]_�֭������I�6�~�w����pPt���ƕcyN�s��tEwHt��~aE6(�~ۭ/}��j�D�/�k�]�[[���c[>7�Z�������������i������A�n�p|;��-c�9}Ew�=��K�\�<|*���_�qO��PZ��_���°x�ӥ�K��v:����P,vn��Zg��z�����;P���+�Un1��@���|������+�� ���hү�D�W3f^S#�{��4��py��n�����~�к���R�}�\�={�=�m���/+��Y^��7c��Ѥ*��ˬ�/>]���KW��}�P�*e�������xy6��U��i�����墛/�����z�}<�>o��G��^��ӐiۙCfx���iUWz�+gK�w��כVm�p������çxU���ޓu�S,0^��xEێnq;�\��+⸣y��B|���F�7�z��Z���\�.o�]빻s������j�n�\?.V��}�־w�_*l)/���膞�G=v����'��� �y�;s��(��f��Q�ŗ/�ٗ�����������jy�l㢱���zPY�z\��X{�������(�a1ʖ�>��Q(�,�tFQ����2��e7��cޠ�_��׻;/U�|�x�|yy��}�l<융�;���˧�J��=��S}'�JgG~��8�h⳼��ު7S3�(�m��d�bo�V.���������ǵ~;�6���*��ț�������S��k1�Zg��@Y���D�!?}Ex4�YVa�����ެ:_V���ӑ�l�WW/���`�]�xYX_��/�qa}y���`�i���/��Y���vvܧ��㎦ >˔;��[/'9�Q��+�Q�������eiem�.z��*�����[�����fsQ\��ֶ��o�V�zG�/~	7]Pk���C�,��x�7�53�|���e�o_�{�������ng��p$܃�����I�{�;|Z�oT�^����z;.�/,����"��B�5���B�~���^��2\b�հ�Ż��`e��Z_>\�;��×��5Ӿ(�N��gD��~�8���J�4�nV�Z3]���˗����Xjn^������S�:]���[��;׷�s"V{����&O��Q̥eƎ��LQm�D��@� {�m�"���I��'�9^�]�����.Rzѝlx�����    �г3�W}�^�����է��G�|{��0������E��� z�����v�ON�c��9=�?Խ�@dGp�K�D�πi�߬ڵS�h^�%c�V7�{�_�⵺����R��R�[���҅嶆���ݒ�y~���W�����G1�<|��YX�2�6x�d�'��FsЀi�߬��֬|]0�n�zכ��K�������Jg��^r�o���W�������U{��]�ܢ�
�e[^�Cq>]�MD��s�5áD���C�<��߾���9Í�߫T[ͅ��˥����}�\}���ϫW�~���Q܅�yQ�2�cFq��"�;����=�%���$�nՇ���WK�r�}�o.ܶw���~�q��;.y�����m��p����v����w�.��W�~���� k*ħ+⸣Ih�3���+v=��h5���R��\�����n���������*�J����wP>XZ�-���z���K�(�Έ/��e��(��WġG�Ѐg��A�葙���[��yhz+�]q���s�q��瓵û����ޫX[\=�{���B��*����8�~эw[
�o������q��\4�Y��;nm��Y~��<�oJ��ͽ�ɒs���Vi5W��R��X��W��ŭm�]�w��ʣ�E[ƞ;�����Ao�"�:�J
xV ���@~F�#���S��+WKW����|����5<z�O����J�w$��W|�����-�N���؞��*��O]z�5�(�V�>^����x���s��}�sz}a���A�qu|�Z��Ս헡�:z��5���[��)x�F����^���WDQw��y���fM4��d�e-.@9�������}<9�7�{'����Vg��__w���խ��xg����Ɖ�Wd3��.�(�����*��+� S�Ld��VdrR[�ֿ�_nq�_�E�paUX������C��:p[�������v��_���.�^��ܨf�/�� fnf{��qБ�y&��~mX吏�v�ܒy���}��Rꇲ��p�|Ѹ�8��+�v�a�=��9�g����v�͘���rd݂��Y���tE���C��l�����(���,W�O�ͅ�a9��緃����w�-�������R�xo�mo<3meS�}d���U˳��ip�OW�AG�>d���;q��T����+08���t����B�y�~�n�ݧŅZ�?_�7n.B1��ֻ���o���Q7rG���Wf>����q����泣��oF�k���_�G�W�`�vt��p��߻[��\�-Xg���R��qv��9�<mg8�U�-A�s�o}���q�FS�4��wD���;Q��d��O�����1l����Z;��s�x��[K+�ݫ�am���2�O��ϱ� 
v8r��}o��RĽ++�2���+���ݦ�i^�?�����Ʈ����r�_�n�7�7�{/8J���F�z�ݮ:�çgx�1�����(��W��Y;�o��\ޅ��ij���F9���9y�K����`�럭����˳�fX�{��������+��������|�hův<�w�G�>���q�a�a���φ�r��r;r��<�����j+G���a�=������v�7�=��l7��k��:~�����(��z�_�б3���OW��uǵ�������^�����_�L��5Xn�����my�{�Էd�nm����6��Ck�n������������[a��hF20uE����ZL����Ufd�߶�d`��^����S�e�꨾�X��E&������z��d76��� ���Ȁ-�K��,Gdg`���T;X`�YvS�S����0���j�]�t^/;rw�`�_�i6���n^x+G����Ey�z�R_��}��2^s�{�=>��2Y����|�����ŧ+F���m����5�L�����j��p��d����@������~�p�����o����j)|7�����j7���x$b��;� ����k�� t��y�?�����o��-a[��� H5�� �|<���35�\������уB�� ��d��5<O�B����?� p���k�Y� ������ە�c�_��s�$�g<���75�\���v�I��7��Ҷ��X� �A�p�A�O?� �3��-��]{�����@��J;��q�jj�9<��/�L�~߹}���=3Í��Fka��E�)�����G�N��R�7��_w��oog�nN���h����E�O�-�j��
|����f���\튧�Ò�g�뼶��_�ޜ^<�;��[��������Ƒ-�癯���!�!�z��I 4��� A�A����	��n&TR�B�I����#�O����N���%*uu���Y�ԙ���AA����\���j�%���t�_F���sGQ|;�iGQ;
�2Rt*���1�P>�n�P�P���"�B_�Y{6�v#P}F�F2U`P�PA�/@5�e0�n!(CPF�z�ܳ����-��h=�$�PJ�"�/������{��!CP%glCVB��~�BZ;���v�����������
$����ԁ�Ry� >���՟~�@!&���{���=CqC�w�����9����U��?���!|��AC�'UU��h�B�6�W4|�+�}� �3���F=��"|�>���!0֩��]z�<�CqG�w�����9���#�Y&�U}C���c.���*l?��CD�7�!����;\���ќ�@䕆<yO&�W0�_�sK�o���<��!�-��~�4��"�4�9�H_�~�#|�5�AC@�5��g�G.�!�i��4���A4�4y�>,��/qY��!|�=�AC R�m
w��GC�G�ã�.EͧDNEb	��_�h��W�@eD���~��8�+CPB���^E�w+�h~E r,"Eyjm��;��<�5"ˊ
'�D<��"z�g�=�0�g�<�
�x�ȿ�!��y?�G D���˳��B<���E��,�h�E(�,b���O�|�>׳�$��̏ov���%���6F�`?�/[z���IY�~s�wx��3�۫?�u���']�._7b®�OJ��P��f��~R�E��q�+!~R�?)��Ia4?)f�R��"���S����S�?r��w�I��O
��I��O�nsTel�+�c?�OJ����S}W��kC�w�I��O
��I�0{�
Aҗ����>�O�!�$ ���9^B����O
�~R�O
�~R�>H�
�S��l�dF}���׆�'E��B��F�B��B�p��%.���>�O��,	�c�Q!�O���'�~?)��'�"?)��]��_�h�T?��e�x���񎠆�I�;����'����P�'@!P�+���'E�B)���4���5�O���'E~?)��'E"?)��!�C���#�O�����ӏ�cģA�XC������?
�/�C��p�_m��ͭ���3�O:���<���的�lp�CN���x�[�� U��w<�s���2�jB �$���Q�����T�}�P2*�2FҀ�ـ*#G������_�����ȭ�|�o� ~�r�����Q�I�y6�b�z����~5�!~-���_EI0.%����Y��j�E��*	��e�g4
����h(@V~Ǻ�Xa�K�%�)�;�B��Q`:�Tz�J�'�z� ^���Zw|�s� L	�Z"}�Q��-�@@U$0¤�����h���Zz^x�$y�1�Iz/��$��ǪkHƼz}5M�e?�����lh)l�����:����T��Fi��ᵔR[K�?r�N?^�z5�]��繎��v�~Y���%C��>�[z��_�C��D�m��R %%(�H�
�x�zѪ�Q�l��-v���If��=O�u��Mb%�-��	�/�q����moR��)��_M��H����k���;�IB�$NB�!�s�xz?�;���Q����4����*۶�붉i�(m��Z�Ю�Y��T�^��[[���    `�u�m�G����O�u�n�n۫��%�yU�`�u� �Ix���)�q�@pubؼ���Ȝ/�Ƽڦ�dn�C����")N�����n͞9�z��[�Wd�q���|�� N$�9>�������L��d
_p7~���we
�+�\�)�L�[x!͉i� ���ͼoK��)t`X[z��Gt����\sL��i�8oʖ�+���s�k`ԣ澺����4S��u&yO?LC��O�C_��25ɓ\����ZPo�y����ߛΉ�³A�e$& ��bh��mzlj�M�tSRp���⩒����W�L]�Fj5��ew3N���⚨�
��<�a�������e�"LEw}����O,��C����2��ݺa�yW�H��)gOU&���ܦK�����s�l�Ӓ��7���6�O�� ;MTRAj(�Ip��!RL�\3ԃ�Sׇ�T�y�:�tÌ\Tw'}��������-R�����l*A�S�|@���w��� @0���ง�c����]�����x���|��^A��v�r7Z�n��Z����r�mq��厖ߌ�O��?��yso(%�BeU�}�;	��H1��q�v���v��_����Rj�HJ��S�q�{2<_�E�}���uu�L�>~�	"��I ?������� RL��1��o�Y7ʾJ���j��a���BU�$}��v͜V�t� ��jV���7�§B
�p�׀O�k tG<�,̀��@Cm�F~�5���-���¤PԚ�lsSK�;�r&.���Jw�>w� �_ᓲ!`�D��+��$8���7� ��7��.�<<v���beZ�5GKv�R(V�nmpP�|v��A��m��^E�:�<�,�����2�����N�C2x�H��������9-;{�=>�i�����7.���t���^&�z�!�]�fMiVe�lu�����>�aR&@��W�$�I0�aHZ���pg��\b�wn� �������c/}tS����i�V�5�s��qyp[)��W��@�ۗ"�_q��������"���η�Ǹ��'������Um@o���8M4��㴮2j��������ӄ���� ��N���mA<ܖ�'38^��OX�饽_���H'j��i6ԛ�+�l��]ӹ�R�!�q��.)I�7�p�w�{F�������Y3����R�Z��������p�ao���7�roS�o蛖��˦kٚ��yz������\.ɻ,�����g��G��к��g�$1!�S�w ����U}d����ٜ���f��`d��'?�l��2�孎7���?�O��h��{Gv��I��Sk(�}E�bU�qk���Q�s��)v��Vn0D~&�>�M=�]fu=e�O)��=���:��=NĦuվ=��Igz�=�%5j�c#kjV7���f���[;��l0���Y)�a�U���I��O�3	q�]��UGɦ����D�yj 2&?�U�&�?��W������������ZG�WU`o[�� O�e��.p��O�x4,xi��/���t���}���!9a�/���U��R3�+A'#p����KQ�~�>{j^�g��0�
b����U�\�׹��|����f#q��JC�%�ca�n��\����m`�����hރ�
�@f�'�0��/I� �%�� s>A�'�0G�\5�0�|��kΤ�l���	��+�U�HYةAy/��fE�R��۩K4K/�;�kD����=C�1J���=~+����D�����O�JVcq3�c��\Zf��-���{�ڽ��L���҂��������xzj�{��R��TvF|~1����9�#�?�r��a�&�?"�ɝ>������Z�b�� ��k<���ŮHcg�
���&�Ѳ��,��'����u�/�8.���	<��}J�X	�'����X<���a,�N]�$��o��9�7�� �m�R�K�rN�X�$��F�o2�������V���5�)~�g���?,bqs�o�Y��l�$_co���T�+y�����ܼ�p��Ӯ��ZÃ�4����*P�
�eU������`,n�'�_'�?�/Hr�m<Gs��u��n56ue|�!\��Y�\c4]���:�������}��$��l�>|�}��������O�q�ǫ�Nj.�nuQh�i��+5!���VIU�K��Gy}�E��
eE�����+=��5̡w��a���5\�@?C� O�����˱��Ņ^���d|=�	xp�fF��n�yaR� A�h��'����H`,,փ��Dۍ�n7��"�U��x���®��|�Y�b����������<w��~z��^�	�Y�O�Cv���Y=9)��@ay�����e\��k�?�*/��.���XE���]��MS�,j���K�x� cO<��n0��I>	���K>���2 �~������o�Lxѯ�v�fˡt�Iത�uk/���U�q0{VT��J@I�V�e�F#��a�O�cv���0Z�9�l�^D�Ԫ콺w����x;[)OtTؤJ�>�Pԝ�N�,���u,������Y=#��
ι���]�F� �<��W��%8�a��0.b������<C�(��7�Q�]��׸9��t�ӥ�ա�I��F���)^�u)Ɵ����tI�_2-��$8�a��0.~�e�Jp͜g/!}��O��}�3���Ƨ��h��&�t�(���5�u���mG�����M������"���0.~�x��9�>�k���3߮u�Ѫ\��ּ�*�3��u�Wհw�R99�N��]�#�R~�XQ�(�����[��/�<3��q�,�+�Z�2X�˫\{5?de�7�vdW�U��
UKm��S��o�|t*Ϝ�e�k��0b��"����+^
�2�;δ�	�9��T!vk|5���s����6%����L�.I�+�8�G�b��X���%8�a���ny�P����]�)}�=5��^��Wr-����e٭��fG��Ŷ����'��~/��>1X%���4}v�lQ\�V�f���m�Z�*�Ҍfq�/�v�]㓑+oՙjh;�䮥��_��������{$"6{��?�ޢ�譎Mq�<�,��r��,��.7�=]�w���k]gSh������'��eJp���fO0Ox�/Q۽_��(�g���~\�����i�|�x�G6=�m�|�{Y(������p���e����z�����Ϳ�7�x�˻����o{IC���W7�������#i��-I߽ޙX�>�U�������?����@:�!������vZ�~V�z������BʿC����6&D��S	�vf�@h����ٿ�؟��V[��{}�z��-�p�<žo�t���t�6&<v��n�8��=���Û-���-��e�Y�vA�&o���fś5�ߦ��/h�8l٧n�a>0��]'�(�Ɲ�(W��a��9�N�Ul�?��A�X1;�����z۱;�{��%)��I�煄����0��o\Q��]\���o�]N�sQ�\r:[�\O��՚TK�n�Po蒦��A���$�Y��Kp��?{����1�'��r>z����l��(����Y_`�.ϸ�\�(��L-��lp�c�U���M7��c���x[-�	R�H��e�nL*�\N���68�;�`Y�
���$8��?ܛ֐ʖQc�b���Ք�i��`���	[e�������/7������#���|�G���_|V#�5>AYb[

m��K5�6K�B-�;D�����)�A�Gnߧ��Fn{m!���m���l���3�J�0n�$���%QHkqSi�4z�U۝�{��s��c��>��Z���Uq�Z)}�;��LB��LEw
�N����g����C�DPR��Z�������<qkƧv�f#�\���O3.���k�{�ߍ$V��L�*���|�ꓓ@RH2��c�C���(+�OǌE��b�B$�d�Ĺ�$T�޿cJ�Gi_5]I� ���/H9���    ����~�܀�
����F�'-#^`�Td	I��Q�Q}t<�֓�[˿C��d`��(����*4rJ_Tm�;�����p�-��o������G��˻SQ���C��� ���ФAD���G�e$c�U����}�[�f��+�ͲGn�yL����|��_
>?������f��aA�*0:��Q$C��Z���2�а�-~e���l��|m����{��G��0o$ �%ȋnx����|��$V��w��Gk�,F�����O$��g �u��r���.`��;���I�v��O&��j��yq��'T�,h�>��a��)e�#8�)��	�o"��JaH��'��_��/`نb<��@��z����u;[Y�k�v5�xhU��)<�n}Q��=4o}�*4����ě�
���;	|X�	W�������wb���Vu�5/�����ܥ>ԋ��fw�ZN�&]U/�Un��Ծ���pR�(b��K�(4�B��韍B��~�Q��4�}���� ���6���a��t��ձb�Co�X��Φ]X+�B}���%lg���_����I ���<�ы>�o����z�{y"L�ҕ܎�f�io�Q6�j]X-.�i�\X�f^���U����|���S�D��Su��$�ªp\�U"�H���&��#Y�ӛ�!-�˝L�1W��3�Z^��֟���qA�
���*�r��%8�a�8�r��E�Ҵ���>�s�[}�ڗ��>���ګ�\#_h�F)X�O��N���^Ы����N��J�$�� �Ip��Zf��4Stg� xg��\����n��z[Z6˧��"�J�B�e{�?��剬)��zq~���]� ���$8�ai�8�4r��\h��᯷���p�ueם4�!7D���@�uw�.��[�ws�(a�H�{+KD�x�:���������q��5.���xAWBn��Ű;��:�+P"��l�N��+���ڶw��j�[��^���n|�����?�1��E�ᯄ�uYo�,�-�Od}d��~�����d�r�z��>�Q�۝�T��Ʈs�[��8j���
	����0�N����t���C:B�QE�*�R�a��uk�mo�%ln7�TƢ�z"u�m��"S�h�����EC��n�He۹�.O�����QuUo����8��<����a�%��vtgr=���rv8-�M�m��bW����~����G�!�e�R�B �p��|'��c�$.VېDM�͹!hz4��Hw���d:��FF��D=U��b�kf�u��q]��S�x�T��b�>	��%q�ۆ$�Vs#�GuGn��Vmݶ��EU�s�v=��I�d��h�3wv�;�7y�-*�r��%8ɮ��-�kr��#�$.r�\���=�.n�J�h�fI�I�-���zH��y�O��dItͦiTK써�>��}��C���iR�TU��}��Ip�Ø-���:�`	\��.��[�.�+k�u+��b2R��tP��VkXM�N�Z�}�7���))A
��w�0vK�b��k:qZ�~{؉�n��m�q�a��4����R]7�)���1S�h����O[�x`%)��D)��}�0ZK⢵�$�![�-D��6����i�^u�㫁�@����(u��(([�֡�����}Vϧw����,.c�w�����g0�+b
ӯ�L���=��1N!�@n�s���,��̲���[Yj�ӂ��4r�hV��Y]��曚ۚ��v�2��=Z0�Y-��e���vt�l�0���v�����N�$J������_}QV�GY���QV�jd��i�?�4��1c�T�w�ؿ�}_8Ǟ->F$	�����0�C5K`���_���o+C���
�C{�۾n!��&��g̨���,�����z
�������j�_-�7�A�2�HI������}-�|f3�:{1��B[�W�,�d����h���n��L�����K��[��x�5
~[F~4������(�d
��D`<r]ï�#�(-���g@o0- IEVY�(�U��7�K� _̆/�к�������þ>�����}�UG�$�%�w���+}�W�U�v�jB��q%I9�Ԃ�C��W"��\Lѽ��l����N���2��t9���O�V��j����?�o��&NT	Aa�������R�&h���6pؘz����[m� ��l�.:���m_�-�J�cP�r�]�� �$#+I �#�
�;Tx�=�	�(]��Ip��B�r\�R���~`h���h��r�u�����}��wf��q�q�96��V=a+�%sl�V�dJ��~�䤌 ��L)z'��ˌ��ʔZ3�'�Q�(7Ss�)�%��`����&h�v��ĊT+�?g�#H��":S���$Y	�ɨ_�?1��BLrLyRv�b���9C��D�qi�����$#)�-YϠ���Ԡ˥a#q��J6Q���_����e$�y*\A�$8�a	�rLYRAV�H�����ei�vIo�y-Tz��:�����m.�К゛���(�S{_^���3�N����E�N�$8�ak���Of3���o��q3:��'��(H\`/�k��8���_�f��߽!H"ʿ8d�����zz�A���/w��h9��hx菿���~D2�g��I�PH�����0�~���q��^�,_(������
^�����G�>=���mZ�>#�O x7 �܈W?�0���klW^,��V����h�}��@RN��8(S�*j8�?�O?����@�o`������࣋#� ��:~���9��6�|^F�E�
_ia%rL��v
F�0��sG��e�ޙ��r����S�asu�	nk�a\�ܵR/�
��'���i!�k�������?��@�)���[q�'�n����_�]z����P�����j�u$5'ε�lj��-��n*�v~�j���C�������XR�]�^HF�rظ|�ģJ�F�d���Wk����6�We���6��F�z�Ұ���Qs�;���O���踳ێ�#%��TUe�#�@w�P�`,9��1g�N�p�`ˡ!=:.OvR���v��-�r��D�!����iީ�L%w��tgc���C��&$IL���=��N�C����}�%�A�Sz�-ڹ4˚R�����˪�bc�]\�M�PL�N�O��I"� a(�/�0� ���AoiB��C��z�8��.� m���j�`�����guSNd��/\R_���m�*B��I0�A�G���g�;�9]9�6ỳ��l;Ym_LK��F;�|�Q���Î��Cx����vp���n���=b�S1���(��>�Kp��<�4?8�}q&������>�W�X��-��9�����m�>��,g�ez��r�RbL�[��X�0r^O�r����_��V"Oc񀻆�����AO�_x`0��ýt�O����X�<oo�y��7������2�*;0�\F�����f)�W��^&��=�B����f���b��>�pw��&�}�>��R�g)g�Ra���VO�{�ý�*Si��SӅ`���ڞ��;�,q彾�{�Kp�Z��HC#xȺ&3䇇�Y&�\-������P�W���`�(�q\Vv���J�Z7Q��[�SZ9�H��7�[>��ง1Y�e�O.�����C�G�5�(��aVԉk���>�w+s��˃���H٦:���#��|G2#�*��G��งQX�5�Oey��d�~ؑ����1����;��αtѪ�ava+�][E3���� �}�?�b1z�b!�R�$8�a��CaM�;�^��w�=,��T���R�u<0�^gg���w{�z�f��B-�t=ƦcO������z�ĸ�(�"�癘>	}���PX�U@a���zLa��U���n�.,��ufUX=�<��&�6ǗC9�+�=T��q�9�*��TQ��y�Y�O�? j���*1��;fy
�yv�� �l/��ћL�٬Cɒ�R��
�ݣDWV;[�A����'�3\�����f    �B�%��0� $$b�mě��Gq�j~�%�o<����@�Iqߚ�)�П=�m���~�Y7����τ�>�lV/�WA�w<KًA�����P�y��>��C��{J��U!o^*K�����w� ~��IRHx���yp��{/;����?RTJ��'�>�|�P������_�����x�z�����Y���<}�>3�=���7�$۞�Կ���;��t�ʿAI}�Ҿ�n惡"+c$�B�*#G��G�UI��|�2~��������r�}�?Z[�����r
����iV��HO��=�Z���4(�7���6�*0��M�v���Pͯ��anم�do�Wˋ����2:�MP�k��r����1*c��u�W� @ɧ4��w�S�;6%HI�����{>2-[�z���������$%��;3g���_������Ma��]�����l$�4R�F�[1
,0���ևޙx������l�;�<
��@�2
����3e뛮�E�6����_b�m�HA��I4C7�``��o-�bD�YA�݆yZ�xb����x x��QR6���B��F�V�H�R^5��q�5��l.]N��5�I3<iN>7g�Y�'Q>��`M�_�����9\�xB�������_�(.��2��S��N�{�^����Y|��֤�h�꥗�幛��ڂ����p�ɩ�L��]~��?���ِ{��@/���МkH9���������zǘ�.W��9t��5}��׮Y�Nk��*�/��a'?�q")�"@9K�G7�	��0��K�C2��+[A�S8l܁_���<0�N��܎���r�Ɓ���.�P�9�i�t�ףj�- ^�%s���s�<����,%� �����ß�<̝�Q�R�.k�m�f�VU�i�,u�����2���rS���N��I 1��X?���C�X�(LXy��E�A������{��|�~x��Oi����w|��3�?�y����8*� ������K�1��G��G��jL5{�ptp���3�������n����_�  ���5��g�>J�L|s3	KzPb	���_L�5��+t!=$t{8,�c�>�����:[�{v}��/��|��j������B�Έ%v�'1$*��&?B�/���%�P��{0���]�_<��}�:(�O�yi/�+ה���"'�ݡ��$�-z���`�?�0A��ձ�f���Ip��r�x���N_��܇9V9�?d��jeNJ�����.5��|W�K�*n��~�	��������m��$S��+w���%�pý��kB�p��<� ��t:o�}��Q�]4*@��v-�pJ��5S�֊����c������g�3��2�E��~	�=�Y#����8���٦���1ؒ�>����a�����C��/1���ޫ/���{;�<��; �9��q�A\�¿{��,����_�m!Be��0WF/Tc��U@��'|L矘K=�NV��[��֜�w�f!	C���g��w�}l��>�
��m[ I ����>������@luP��
Z���ˤ�E��lW�V�lUj)ۼlHsZ�:�pVK��vl��^T c*��N���yV�v�ϯB����/�	d�&)��#=a������Z�B��`��(�WC��? ��T�O0��?�����S��>⧊���Y�9<S^MI"T;��η�ޏ$��?[�$,@���q�;,��x �ki��F��^m���0�uƳB�{X��-u6r#�ݰM����ﰌ.�XC�0B�,�/��#�jL����f�F�Z�e������2���=���W�Ώ[��N���w�`Sm
N�?L(�.ꄰ"����L��?�ϫ19���58W��o�B����X�6ʰ[�r5UJ�cs3V�Y�Q�ks~V;��K)�;��O��'^J$*��/����jL�f���l;�Ƀ`������j�Ɠä��U�>,���Mk����vzi�;�n�7��G�ߔfɠ�����!��`2=����>�ҫ1y���@��A� Q�\�D��3�J����ܱ�1�������]��Ν�7Xu���A��!t�@ ��i�/�5dWc�%��k�2�i�M	*Ã-��I��hh�ZI%��z*�s��5�J[��v@HF���B�n-o�+�.�>�櫯5������1���å=�K��t4�d���<�ԵN���T

�L�l�1�X�2k�]:��wC/�T(!E
*?A��Ї�Rb�(�v�������uі�b.�9j3:\MP�^1�����\&R�L�r��D?��e>�� $����g�Hp�8Ud)&o�˛S Wd9��?G��l��s2�V�M��j�D:�����kӬ��oע���^�����+<yAA	�Hz��>$�.K1��8��0��qc�HXn��ΚiF~���/���o&N�.h��<?7��cV��8��HT_��E�c��T���^/�;Zbo��C����Ӄٽ/s�ٽ�w��$�&9�B�RL���`�=�y�aF+�R�I�%���ZކElﺋu��������*�����o���_�1�.��)XЃ׳&��>�>2~��D=zA��!�����̱�R�z;��o�DQ�1��䒙�|!]��}h!3`��
�5?#�,��!��o�#������ĂׇK�F�����T�ݥ1��۠����|(]���zjM;����ܝy.6;�����|�{��d6����نo��w�x������-����a����*7��������	�$�P��T�g?����30Σg?�����>?�秲�sɡaٗY"�.����������c2�|��� Ϗ�8�D4A�.��,����a�t�`z�������b 2��&*�P�{_D����Ͽ|GaO�&�0�����͊�}�6��Q!��q�*N���B7�^���c��w�j}�.t���_��0|�,Iϻ�@/\�%.'����q菛��r��@B`�h�R��v-;�=O�e�&���V���~[X�cWB�cF�I����u�=?پ|q~��?9��O�7R�T����������d����k�_~ʅ�#���g˩�_o����i�*HB�J���W��U8܏�ǘ�f�E��i}�{�.�i�4����=K�T➻3�������i���;)��zx��wf����У���7�@f��l<s��J�T@��ȋ�����_z��?�a�^��'�]y�|%�u�X�3�'
�:ؖ��F�u��iMiW�S���3�ӣN�|��O��I�����x�����ʜ���/��Q0��r��`�K.�X�3�F^35�EU�^����6z�|�xR�'�ss;]�����K�n#��	���x�W��L[k �I0������;|������IF@�0�b� ��[��O�c�"�׫��r��:Ş� A�)FC�]qE�>�Ep%�^��'s���9���4#��sl�R]Y]�����IS���1�l��-9�jAJ�(	���%�B�^qE�&��
,[Q��)��jL�����h�Z�j��6�-JW�j���to�n�n�?O��w yt�0RC��x'�5���'xfjL0X�K#�h���Z�Ά5=w���Ѡ��t�R�J�Z۠�ܰ1T�Y����Ӏ��@�d���d@w\!�2�'x�ЗL����*�=����  �� m-�h���N�T�렾�5f����)�L7�5+�L�߬�շ�%3��|���	�Ac���p�+���n� �g���Lo��]jh��YQ��m�;���NW��c�EK��)�5�'�w��*��� ��@H��:1H�s�i��tWp�Z���.����nO�YU�����w%������N�y���A����Q9D>	��0�$�'�djާ0�������ٽ]K�V~ӣ��^��dL���l;��� o�H��6���P�K���+*�j4��7�'�5��D�Lm���O��ew�O�8l���h�vjU�;�iv6^�d��f6N��/�U���7܄    ��Z���fA�`����>	��0���E��$��(ov�.Z��h�T���fQkTn���t��n�[���'���`ҧ��]�i {7MY�@
��4���^�0���E��ބ�9onB�9+��zR���ܘ����N���r��N��Y�˗:�|��oɡ{����/��
&%TAY��Ip�è0��
{���%�Ov�t	�{z�H�t��vO����K�n@��4v����w��Ţ 	� �i�JbF����i�/�5F�A<Tش'#�'�
,mq}<dHug˙<Yݤ��=;��71^k+'W^w��Tޙ��-����M0R߈</� I�H	N[��Kp��(0������_#߸rWz�e-��攂�إ���ի�A~�1Ƈ��Id;Z���T���-�~k0{F�$�D
��˼v�/�5F�a,�i���@O�o�M�4)�S�w��O�ʸs�d��D����)<��k�H��Q[a�f`�K�`���5���#�0�4�A�j���at@�zn,P�G֮�X-H��F3�5�4J�ġ�Z�ӟ��{ ^_IU��ty�Kp��`	�D�`H�i�!QN��A������3��.����yk��*���2Ȝ3��VXV�ϧ`2��n8�|eW��ߞB~/\a$�B����(\�X��D�;n=�f7���_�K9�J�z��*�\��%����]�����AO��>aa���I>	��0c!�^Z�1h��ܢh���X�ɦK��v���R�8,/�Z�4C�Ymi��)����+TM��
�R�7g(|~�����U���Ya4 �B /�F�o�)Л����U���3b���AW	'��ݔ]TV���|qk_�*�GV>�(�����@��Ѐ'��Q��2j�����J�qֳ�V�m��֗��۪U���l��:1��z��
�y)D����$��� ������^l����E��/7�hޗ�;|�:����K�5��z��tj�Q��hP�'( �'e ��3���'���(&*��Я�p~;�an�1+5L:&z�[)��l��L��P��"��M�構�:�k��'�;��+*
ނ<��\aL ���m�l@���EـV�̋i�J���`e2���c��<廱v�{��<���?i���EE
EAOГ|\aL ����5X	Ԑ-�e���l4�����:	m���n8҇J��lk�����!��%���^��E��;	��0"��!����*��^�K�=�W%��n��4p$\�"��s�^.o.r��r�Q2Z1�#?� ��X�H��� x'��P<<�Բ�`�H����G� 1+�q׭"/��㾙�N\ܝ��E�tmi�Ke[��\�->?%�� ���C�m�=�%�a(�o�Ƈ_�b�o�5JRJ�V�:�T�n�"���|�ho=|�Z�r,ɋ��nA^���e(�ax'�X��ba(��nSӥ`;� ���S{��ZX[�Du����XL��9;)s��4f�Y�~	�4�Q�jP�,	�����$�¸0��s�������ۺ�m ������g�6�
�w���^&����_�&�)��$BL�B&��$�¨0��
{��5s����{�KW�f���Y{WZ�~���!+:(g�~B�Cq�ˈZ�~��3��$R�$vF�;	��0.���¦�.<��,��E�ĬB�,�.S�ɢ3\�(�T-ggJ]��qvJ������1&H`	 /�
I0���$���0��3�`w���	�p
���L4�"�e����jf��:��s�>�t��v>]�fb�}@���ATJ�V�_�+ ��xذ�5����9��(�|��Vhqod���;�0	,�(����GM��[��K�/q���KIB�o��N�k ��x�0� 6-I�)2yr�Y��Zg��l�t��K'{��PyTN����8q�� �!���i�!��$���0��w���Q�DQ@�0@�������Ό�:�̀��&(?�&t�M��W\�C�
�=�{�"c��\al�ņ'WSpX�(��E=A����a�(�W�l���s���*;�����r�`|�Y�| TU!�~�qQ�0�G ��E�(ՏM����׮ef:ng�ق~g_-���0�m]�R��w1�p{���10\J�(bw��`
 aT�D��d�
��[�[E)S�ݖ��.�D��.�H�Z��g�R��W�V�Q��O?<����}�����O��
�Ԋ����W�tߟ��Ճh|wļ�:"�<՝�{��L�{�e�����&����;7�@6�g6n��������!�J�c�w��	w�P����d��ՙݭ���_ݞ�����H�#w\a�D����,�40��ł�����A��=lK��v46G�To1�g�T�>���zՍڐ�7k ��d��Wr'�5F�qL��
��q���	|Xs�uR�����p�m��l���q��V;}X���ݢ�O�ay
���h����X~	��0Ob"�� ����fa�P҉��ǛF��&=m�'m��Ť�GC��v��y���ƪ��K��>I��Y�D$~�'1�w[g�E�q�aJ��6κtql�����5����]}�\��֋JڮVb<>� ��u~G�!�/�F�IL��6�n���6��<4f�y\[�e�&�+WF	��5ϗ�uA��}��E�%�d������@'1�w���� \N�� 3�2Tw��~U��wi,�EѢ���jnϕ4��Lm3�t�d�e���$�Ip��w��l	� ��[�3`��3��mm��(��؅.(�C{�?��x�%��V�K�̗�y�'0���A�5H�����$&
oWQ����܉�ba�ù��j��-��Z�+���T:��i�uF*Y���V��?=��) A��KX�ĕ�$�`�'qQ��(��y�hv��QjRϬ��õ?�g%E�mW�LϘΐ���zY�~(�� �f�S�������Ӏ_�k ����p	�*�:��*��|(�[���j��\��a;Eպ��ڷ����
V����� BE�F��$���0��[�[v� ��(�@-�v�T�K��u0���H��TX��q9/�h6��{ќ�?� ;��)}����tw`��_�k ��xȰ�B��&lYD����o�ܠ�7�ӜNvRE_c�k-c���ǣ��p�c}�{� S �����$�N>I�'�F��x�03QZ��֗�Kͭ-/{���r}��:��jw���2}��;	s;�)x
@�w8������
c�r<l�)�*��c��t��n(�6s׽�]k�Z4�	;+����k�-.��\���G� ��3%���OSE^$���fLy�Myj ���Z���87\��"x{�f��/�>%5�j�K��<=��R���9�Ip��a9:�4@�`V���D�*���2��Kc\=���L��QSW����h��冞�#d^;�_����/;e�	����@���Ö���ʘ�e�M3}�з��*�ɤN{d��+|�&�Z�)]̴�(���t�9�����@�I�}v� �$�!V�?��,��#�r<d؃?�iʃ?R���Q$ƶw�wK	9d:=^�^#�V��.T��X���p�E��0C��*ۀ~
0�Q���~IP\B׈T\ҳG�sW��5�в��z޻�g��=�[G'Sv�眭ʅ��'v3��7s$eU%��蝄�Fas��
x�ܮ�1kE��/ƴGvy!�]�Q���sܠ��gELM��݉e=��G�8��y�v��[]�j�����) ��eWJ�6Rn�@~
�'��$��(@й�ɞ|\a�^���s��E� ŻH���>Ͷ�=ū�]�:=�ּ���5�w[��G����sD�5 !3p ,VzR�� �?���q�zC
��i�Ea��ֹÿ��R���\l���V�2z��~K��v����]ܸ��b��O@/|!'%UR�бB�$��x=������`
p`$�8��E�7���r    :�fr��$�D��H_T3�Д�@��EO��hH�#��\a�����"��0��7v	�~�D��k�L���ƾ>��}cz<�vtZP��+D���WBL�![�_�k ��Ӹx=�4^�A�[]���r�vFۑ��Z+	7s�n�tW\��Q�jK�/��#{��IDB���e}��q�*
N���w����͢cSG��&�J�Zi���9�O����X���=�3�e^c4��>H��0�\
��?���
��4.>߸��9ϺQ|Z�uV�i��YP��(�kj\��]e
0�gz��������i SX4A�S�O��F�i\��!�������uU_uۮ�[�� 7�Uf��I����or�k�o���������13!��_�) �Qz�o C��;�(;�y��
ҋ��r�)hffw J&Q>W�)R״�n�ֵ/�e�{q� �;�Zw{
�Kp�Q`��Uz�t����NER6��j�+����U����ӗAcv�֐&�ƶS�װ��+���R+
S`�N�+ �Ӹ(�׶F�����sl��SwuR��o�V�9];Zw6�c{U�KǔF����K8��~���q`I���#�4.܁B
�6"Q�J"�r��T'-o��{dkt�pz���8W-V�v�6�
^]�H�~�D�!��Ip��`%.���*%� 'R��a�.W�Z�� -NȒ:ckY�ɵia�U�RJO���L�#{@^0[>b��r'�F���H����U#uN�{��ɆKå�H�4�2���6X�W�sn�2��S'>�k�� ��E�040���	p���v��G �D���1�Ȱ�N��ŎL]�!��`���|waW���z�ѾB�7ßq\H�( �~	��0"��E�'@�<�D����V�ڦԻ(��뒞NSiW��Z�g��b��iVN_!�ƫ�o�X^C�;	��0"��E�'88E�+��4E�6�:���N�ꡓ?X��;�J�J\�Cݦ��e�_/��W�8���7.�"�r��Ip�Qa%.*<!����H�5����R�,w(]{����"/��X�P����T�1�|~��*�C� *�)wL$�
+qQ�,��\M�V,o��pRNON���X���P�RR����N��h�����>������+D�¶e|؛On�H���U�~���#���e��bm�[�݄1x%.��������z}]j�~���6���q�0GvjΫ�Q3';S"&j�ç7y2�y)�d
�=�%����_���3��j����V_��\���kVlV��%с}|�w��l��F�W����Dj���HI�RI�S�$����_��"��I�1D���ݍK�l�A�jd��AR�4�=]���,۽�t�?���1�v���$�
�,\�W@�Wca�[�`0L���\��RN��$�\�L*sG�o���yQj���r�tih�C�/P"Ó�xGG�?H�F���
c�j,�+�7V(��Q�~�2|���q4nӉ��4�\�-;	�lg�ue��ߤV�LB~� �q�D�����Ip��x5�5���:�F�#�A��t�^Vdy6뺄d���3^�R3��^V�F��u��'>�yͯC�!��|�����X�;?��9��)���{sɓ�����1�i����YNi��@�W���%F���GlW�҈`��O��F��X�;�_GF`���e�F�����s����u����I_KNw��Y�����/�i�+��h�N5Iy�]�	����j,��i���f���5"5�ȐZUY7ofl雪��X�m�i�v�Rc�����lS�
�R�.�[AH�(T��.�Ӏ���X�;�@�l��4`�"5{l�ibӫ[Cܾ����6$���(ITi��>k���Yi���$��\5�9WB4���c�j,L�k�f�A"ƛiE!b��(�*��E�"_�����U��&�
=����v���`
���J�� � �W@Vca�\|��@�[�tn�&W)u	���t�9-�uYrn��ҮX�E�f�u��
��"^�$L��h���O��F��Xh���
���tݫSUk��;	��x�L˛vQ����ucIV7kTZ��f��܀� ���[�����l�q$����+���Ɏ��p���5�� ��;aV�p��;��|B�؍ �����PJ�Ξ*��"����;dH�s�\�~�����۟'8`�՟����8�]Ef�1�{���둊�h@��E��}��ø�}�jb�D�.p�)a����������]�H�*��N�^�G�����H�K�t����g�Ԛ���>xh~�h(�R̢�1�%����
�� ?Xa��5�-i��UҪ����>(�����lb&�ӠYδ��X�a�������g(�b��Qb�T*g��B0 ��AX��:�����[ 'ְXAq)6�
ˇm��/;�d�a���&`@R����%��[�H�)�bD�o&Op�E!8�� ,o�u��5;v�7�J�X���8_�t5��E}?� ]O����Z��`���i)b,�w���0E�s�\�ΰ�r�ſ>g�];�s5��hZEy�UȬ"9C?[��6�|�v��!U�j�?C�<�N�+G% �֓�E�/~9��AX���O +Ȟ����������?M���-%Z�c��Q`�yXv�x�I�h�L;v�ps%I���
/(�D�Ԧ-8��6�s�Y�	įnӆ�|u����<��2˯�ֳ�:O��.M�}y�(�5]����B��L��t)}�Iӭ��9s��p�{o��$�]�Gþ�%!P.
�� �^a9�&�3���]F]F���3JZ�!5bھ�P��a��+�k#c2,J�Cs��&��Oƙ3�(��f�ϛW�)\{��ڛTӽ&E19����F#.r�����Ri�OP`��f�e�m`�h��Hl���"w��(�D���xA!��ð<����/� ���_i\T��:�l��g��t�>�$�Z���a�ڗJ�4=	�O��g�p�
���pSy�0,�~ ���Ի��/��E9�o����Z�4;C�1��ǹ͢��DFh���ͨ[��%g�,ƫ�B�K%\�A�=˳��gZ�`�I�)4S������)3� �M:�dK�jfg=�k�e=y0ɦZ٦?�(`a�1܈!F|{�E��E!��ð<��]�����̒{.�fI���FLzP��By�4�R�� �e-C/7�l�L���g�����8J�̰o�	^P9�0,�~B5� *����j���h6S���?Ё:0֨������ �E�FU����I�N�w��Ap��r�aH���}LGU�ޕ`*���D�Ll���6βE7����1�+�����t@���~�B?� ш�<@~�z�.
� ��Ð\{=F��̻6�;�.k�|��*t���R�_*5�>��ea�<m�:~����!��b
r��B0 ��!��z�zK]�mj�ݵz���>k���tF�Ɂ\�V[�֠vT�>�5-��!6��]��N�@������pS��0$WXO��L�ofJaa@��:����F��4V�[&**��1A��RF���K~���]�U�Q
)�Mo 7��?��!9�z�g�$�߾o�$e�bQa��/�j�wE8C��UG�W��r��f�o��Ȱ�b� Q@d�9�b���Bp �F!y�z���c��-�+TǇJ!7=u�V�e�V��I����v>ݪ]��i� ]״b�3��sMqI�gX��`@�#�Br���}�`���wH�,kEn��g%�6Z��j\L�ٔ+���  ���:+�OQ�*��s)�pSy�($OX�{[������媏K�lM��ٽyҴbEV#�4,V��@�^J�g˦�)fv0���JQE4T����Bp �F!��z�s��q��㉱Hj��23��䍾���]ﴻ��z��j��.�"���-�L�0��=���9��A�0
��ŘVO��s`p�ܚ�QPױ����+�V#2�Gv�����ݣ�f,�)M,i]�?Eɷ3� *Q~�b߱    )_P9�(,g�_�ޜ�Q���{.�m*�Y�����ڵ���:��Ov�A�:ϖ��Y�G�̴3�D>E�7�,�Q�H���8������a����:�����f�[	�J�]e�JҰ�A��l_�~�Rj��6N��jFB�~���ZJ��}ob|A!2������3>��p��9I�3	>�<��������wB�b|8{��mן
�	��QX~���]��EG�ݵ�y�W�Z�:��3�vXv{�E���DͪU�[BJz_���S�1�3Y�E~9�l6d�� {��@�#��r�b����l�;�Iv?.$�SÚ�y8��Ȱ}�W��eu��e�Tό����"�6Į�P��r8���QX�����S����'����D"�C#�_N����e�wµ��J96ˑ<<�O�SU�� ��`ŧ��ရBp ȗ�!����}��ջ��(&���Pn�jk�ŝAE�����m�c���@n� �e�9�7s�poR�e�7��@�3�Cr��)�s
�Աz�)Z��Pکƺ�X��f]�P�No>ąY�v��I#���m~DW� DA~K�9���@�3�Cr�Ǫ_��IK�����\vG��V�q�_���S�8�#�ݪܜ2R�k4�h��Hc�76>�÷AϤ(���R^u�F aE!c�i��B�M!�r�qHN�X��|�/S���B~q�lY�˱b
��ʮD��8<���}@�U+���S��6�	��y%���+�D��#�������8$ם�-ޝ�w��5{&��1�g���]v���8L)ejJM�l�4%���-�~�C�X��`�SJ�p�M!8��\�qٯC��Q���ss%p�ة�rQ���a�?�0R�g�ܮ-���-i��40݌}8���\B! �_)���x� ���S��r����8$�}\��g��@ݓGJ�&rb+�����<�j�us��G��bԅ=�+���g_�[ 8�(R�O�ရBp ��!y��2�	�p�
���]|8K?�'+V�ת%������H���]I�Ry�!!Ur�f��x
q�:!r���D�@�A0�v8��A8�� \�o�ځ��Hɮ�����R�Tu2�}���6?9l�=����o�|~��9CϢ2�i� ���B@���\�q���>ЏS�����p���Ks�[H�β�y�5%�&u�;�8�
[K�TeW�q}}/���4����_]�@�S��]P���^��+�vz#�xpW�a�/+�pæˊ���ǵ�����H��6m�������t�:J��Q�[�
�C���7��@��K��{[������jP-�����Z���)�v��u�RJ�NvP����$�Y�J���+ ¥���/apS���^��ۢ>-z��]-z{4�5��̔ZuWoLȶ�*�ډj���Lk��������%J��k@�����]P��$,�wp���X&w����la3��[2ԦiXP�}GM5z���S:C�g��F�U�0
�XS��7��@�L��Ч��T��w��9�j�U�PW�Z[Z5A�q25��7�x�h��I�hh���FT����J�gd"� ���IX^� �t�����۔̞R5��U�*�ck0�Q��ю[�j+�(Oi?E���"$���Ox���A^0	�P��A'g���g59l��ND�����V�0����ѢSio�׎�E]��:��= ��{]��7�/(��5��\�?�\�����Ǎ�G�!*�2q��S!2An;	�m{����p��+K8U�6�5/@VҦ��)�u7��H�Uu75�����f_�MԕC���Y���8kk�L料��/(��v��>ᶳ�ܴ�$���87g�6��;�4�h��0������Q���f�j=������"�7��5�>���pQ��$,�}B}�[�H�Sz�>lzr�R���2���"2��Va��v��NX/�~�7�\H:Gg���W��A<˃���\�A��.���f.{vG{X�͡:�b]+�c+-�cv9d��J�MZ��c���Q#�A�n�� �����1������7s��m���uy�{��2���sد���Cd��2s���}㍈�Q#B}���Bp ȇ�!��>�`�A�`*��-#c��z5&�"S�[��T�Q>�k\=nf��P��>D�<��4��Z��A^<ɋ�S�f{r�Gߓ�XnX3c��cU�4�2����P�l+�Af[Q�Jͤ]?|�(�jIf>S!�pQy�4$/��|��pL�Z�����Q��ޭ�%����J�2��-ʔ�F�����q��O�B�M�)����-D.(��x�o�Hћ��0�=Agmm���t:<1��qO��4�[3'�����
�>��8��, Q"Q|�!rA�Y���x�ogEᰗ↸C	j�n��(�Ǉ��BU����t�XI/���J�V87� �g!�]�9%[l������3\�A^1�+�~J`��*����zy�,[�d�l�mG9��T��Zƛ�ξ��f�J�"����7�������@�SLCr�m�/�+���¹G�Le+'V�m���f(�����j������0�![�����)�g�3@���n
�� �����e߫XK^��b�(L���l�S��S2��|X��li/�;�qW>$?�"���ۃ@��/7�`A�W,���e�{**mM����Vӛc!�U[�"��_�d��D�{(�erQ�]�l�C�������M�Q��q�[SC.(��b),���7��_�ޕ��%�2�KL���6^���|�="3W��|+YJv�b>��?Cc�h���ǅ)�k�s8�r����b����Қ�<>�֌Q�e�*]H(�Z�ϵ�N���i��Y�گ>�1��$�%�$����,r������g�Ă%02��_�F	e�Rr�Nȉ�]Ho:��l�@�H�Zؙ��y� aQB���āg
�� �X
�-naU�����1��P��*1�]��Xx�]�ک�Jy=�m�����Kd��C���wT�s�)r�b��]�K%��A~��_l"�aqv1Yw��aSS���<q�J���P�mC�(C�Չ��,+�J��	�!�ؙ2΀�@��7g�p�b-�}r�@����*H!#����^$��aޝ����x��J���\m�ٓJާ��X��dE$J�=�_i)]P8in��f�Os;M�?�s#�C�A��ynן
�	��p<zM���N;�p1 �{!;�*B�]�k%��m7Q.d,�(�<0�S%mt��j.턏!�!�C�w(F	�0�ˎ�B� ȥ��q�����e��:�Z��+閽�vשX~f��fU��ca�L����+�U����w�^�WL���oy�tA!�r�p�y-���w���{�sO��x_ڎ�y����ƾv�i6S}��gW��_���?r��$�d?�/(��y9g�;,~��h�ˑT�c}��W�s�Iߊ�z��΍�Ak8)����Gi����������rn##��Ϗ��Bp ș��q�� ��zD\1|f=��㰑76���+��j�X=��.����4���i���|kk0��QĐ�W��r�E�V��	dO;�.��s�E!����p�xͩ��D��S�q�>��jZ��ڠ*�t~2?u�6g7�R�h��8��M��y�CC�g�$}-D��ߙ>n�n
�� ^Ǉ���<ܫl��m�%e��Ҭ�9�H����l�o�]D;�r��,�#�T��|����VQ������ϡwS胜w9�]@�S]&�����~XdZ�xaXH�0�?)��p�&��� m���Zj�e]{=�|�L�3��1,!Y���(�|w9ߝs��\���]�]�4Y�^VK�-3:ǉdoQk�Oe�l!۠]m4�_���"����t�3�)8H��.��۩�����90����Ly�)�7�(�M)�V�E6�#)u�z�J�Wh��"h�T�:���'2� ��2�r�E!���!��6�����]���
    9Ѝ��fo}���Ҫ�K�������R�����	3�z�= �Y��9@/(��_9$���r��×�=miѠ*��NF;�3��B{*���)m7�%�l��+?��r%��0~m���E!8��!9�v�j^��#< �TX��PӲ��!�o���C�`��ja�+q��	�*��qoi��������A�����}(WpS��,$�V�<В*��MuR~ Ikۏ��+m<̲�a�;T��=���B��(;��`	q`�,U$ Bn
�� ����e�����]~X�DOn�k<ZW�CT�&��5X�d^.�w{�+����;p;�Q@cpSy�,$O�n�b���]&�a�=I��)��uw�{��a����M�cn�} ���(�Z�{�j����>	-I�-�3*]��ͭ��Z)�Sb��󷗞23c4u��Y��b�]�E��x=j.fϩ��t���taN��Dߘnv�:�`gc��抵x���]�����Q�z�J�]��(��?^���CJ`���~3�_/���X����ȆBe��1��1�bF���,fNr��i�vk͖�ͣw~~'k�Y�_�@�/gpq�悩X0�"�Y7��ä{`�i\AX�J�Ȑ���!GQ���(�L�RL����PC2�s�v!�
�"��]J�̰,#��<���Pg���a��HT��q��� ��SdJ�A����#�D�ʤk�s��v�K����|��	���O��F�G�^������ojg����Uˇ�:;�c3��CMƈ�O�|���(dds�*�Ժ��M�p$mV�ۥ�ZGZ�
�>y�� �+&X9��ra��g���:��2�4:����A?(4�����*P�*.��K􅯚L� ��}���z�#+���J�ukc��mٯt��J��c�������"�QP:mXT�!�i ����،�p��I�2T�ex�
��I�*h7�X_NcT�G��|�.�tT�S�=�ڨG��X�P�od�	�}�����(�?�n
}��_p�?���7�~����	�2���*���T�� �z21L�QC&]`��}߫�ڀs3U�n̳�pݻ����D��z�^m�0�B�o�H�u��^����~: jZ���T��X�["���
�D�[5���X��-�����Z�r-[p�K����ڈ��G������7���o�Z![���)5�ž��o0������y������Vo��C�gm��h�t�����ΰ=*��C�#NBd;�G0�kj���m\��̘Ε'��j"�-���-R�*)-�����r��[��nֵ�gɑ,	?���+��;����!��{����_�`F���1�3��{3��Q
�B�O��K���s+D!�,jphP�����Z2{R�3O�	T;u�+�dd�aWpV�v��x7 vb8I�J���s���Z��fqo�"9�ϻ���7�/a �∈�厜�\�QBP��qS8�-��f����W��gS���n�\~Ԍ�M4D�au��Ja�]��.Ѫ�{�CzR���o2�o��{����[�4P�]U�=J=��p`�A��P��tЛ�x�^�vZZ���p�`7����7�����\��ݺ�lrZ�*��%����%�����}2Q��$z`��=�.
v)�J=��4�koV��=x�Y�Ӥ>V���-织u��_���"h/�{%�E�a��g�[�#�bfAT2�h �.
v9��;ΰ_�}���i�v�����tx�4�r��n�S��S8�Ʋ�CyP��S�Q���{��v��bK~�§��5�n
v�;aD�����G�'>�W\��Ti[F���h���e;;C���Fq�ɛ�l�3>-��v�_@Hq�!�p`
<GL�\ҍe.�^�۟ả4�h�t�y����ꉇ���"I"�jE_?�2��~��߸�OF}����p�3��"���+���/x�g:k���%���!?@��q�͕�Ǘ�N�w���~�>a��v�(+�8|�@4}��u��bk�v�Sd�U[hY��˲2�O��:z�m�0��L"G�oj�����q��N�%@v_�.���0�*�lg6�ZT�@^L�|�� ���I�'�t؝X�|{���81��*���� &����o�:S~���Nd��tA�t]K�]�®y��k��
B
}���]����
�����^��dQ���h�K�#y��1�����m��W�v�yQ'E�[�u�AGoa,��T1l$y}��cw��Y4�:zYgc����n7-	b��ck��YTPK�鰨����棎�G%�ǣ
f���!wQ8��_����7T,o�$��7���MI�חV���ܟ�iH<�(�K��_T���	�4}ui՗̇�SQ�jܳ,:'}Q��w[e��Ϣqa7|%&}�c�G��Q;���}]2���>C��}��>Z�,��ֱ/y�I"F w��T��I-�?���?=��K��E�ͿX�d�O���ޣ��?��T���sɢ�8���Q��G�������>j�,�������r�3X�\�󘜙��v����J����㌠��s�^ܛCM��c�T�֭�ψ�7tQ�9GÜ�Y`��r#�p��.f ��~yMWm��������n�-H��IM�\8�ԋ�1���Z_������� ���7A~^V
h�2,����b�qY�3�yP��w�#C�<����(d�(�ab���RC���9�C>Y��[��q�v��%s�:}��Y��y�"����'@�}�F�L�� 0���%�%fb
�0�=�CP������ux��.I׊�IG�z�1I��qClpe:�@̊�}p�3c?Z�c<V��J�/3�dbo*�-�D�&iuM�p���`:<�8�Q I���Y�p ��)Ɂ��]B}�\�A�P�vr�����D��r��"�c��8��ܔ��:=���d�a�����5v2z\���n(�k'�����y��T����c�=��`d�iJ�!)2�QD�R� ҥ�I�;�\\�)`2�"��ײ��t�xn�t~I�SĆ<�E��0{�ҵؕ��*�T�rOR�q��$�� ���ǣG�\"�(
�5���ul���w�d�x�T/���
M��X�;h'�[�*x�=��\�rӃU���z���@[��r �(�Ӭ�K����|`�z͸��Q������z�������!��%Z�l�52�$:�M*��l�g�����)�j��r*��_�?Ú\P8�����r�p%~l��,~x�����Y����*�cgd�������7q4�r{"c弈�����/��?�^b׵�ˡ������q{�D�{�=��Ϯ�������n����ߟ6��7~�>�{�#..�q���"]?��7�.������K"2b�7�"
e&�L|��l�e��q:������?v?!7�G��7��H��#_=�Z.6�mG�k �$Fu0E�
OlmG{����D����������%��<"�B�!�_��nX[�a�6�(��#*Ebܜ	#��z[�.N�t�h�fy�Y߮q����v��}>	{f�#a�7��hl���d��	�׾�~7�#�.;���K0�!:&��A����&-{�9DgQ.�� �4ҩ
�˵Rm�,ԇ��ק����g=��9��E�w�qD'0J%�g�"߄���Ӡ�!0��!��hv�r�%��zkyc�Ub��xf�V�a���2��4�v*�|�~TV��>���5:�C�5Laܡ`P�x�r(]P8��A�"��b����M0��%<��T��0P�"����U#����-U#��T'v!s�:E7a�x�T�U�������� �RG�����/��A�����e{c��vZ&2Jm�-���OX�`N�M�%����c��˜`� ��<����Ȋ�;�`��Jy�	�aȵ:�e�Q���]�@q��'����m�wl������M�%C[7f�RK{����L�Ԋ���|Vr��    �b�T��6��p �	�`e�&.&S�j�����Y�Ŝ�֫���#����h���ٲ�.�F�P����0,����'D����,�;����.ȩ�4����>ݤZrpR���t{5�|�Y�>��#�TN*�zݜ}R��}��J��T/6�r����l�3��ۄ$aۉa�,
���\�_7���b%S��9��<�ΉG����qb1��[�	�y
]���.����(��a3@ϱA��gM��a{Σ���h���o^�/\o��_�_��������?���?pp���^3ҍ��Ƞ~���~�DP�21�M��A�/����KV�~{���X�o2��r�N�B�u
�3�Q�̯"]������������u���<��53���y����%���|�7Vzu5YkN>�U�Q���X�� ���B@.�?��~�MC�<ul>nԑ(�2Vn%}�l����UR����C�k�3�Ytr1ר�3L~��&�I�cj��'�\D༾[;��R{c�3{�U�$�nt��3�pm�� {��)K�������m2g�,��C�$|c2��[{n�7,:��b{��A/NT����M���c���wksy�{$�����B�	�J�e����~U{�����^�9�V�u�X[�k|��+����3�Ԉ�3�[���n	�>Eٔ��ƪ�b�J������_jdm�����z�N�+�J����q@�~t�1�t�\cH����X�wul��[C���/v��b1	:
r���-Sl�����L"���:�%ќ���D����x�Ùp8�s��'E�1J�ȉ4?�7-�?���O'��.�oj�x唌��pnxp��^��S.}����+�s���xAy�ߔ����Y��D��gX~���l�iK��(�I�R�	H��3������s<z�%���f������͈ ����v,m�]%��F׻���Z׆�Dr�e�z>Ҫ2r�6.��8�/�X:��R�Ȼ)����_4y���b��4�+8�����C'��I�s��"홟�Jz���˥k��-���}��7� @1+K�m^�:7�����L�h�Km�q�����Ȣ���?/���j����\���IBA���qX�2���f�s������@p��7��]���F�_�����v^��`�~D%=b��#�_aѭ`�;Nt�H����	P�0e�u��'+�xk��!�Ʌ�	u��^��a�b����v0);Y�7��c���U�Q���(QY��U��2���X_�C�o��p�ӿͳT�C/�Z  �[4~��E�@4�1C@>9h�s9��8o�����FJ�����T,�6�vj0�M�Zn�eڥBL�����"�`E��㐻)ȑHþ�:/i����4la�?����\��|km:Г�5��Ϳ2�f�X��̛��I�����y��+�S"��� �?�燗䦤���0ɏi�fwţ�fu���|�������rJ/@�l�����h���ħ?��Wh����%ǀ��SY�a�H
Hɹ���x���o�������� #ʕ�%v�Jۜǳ\0~k��w�2�Ě/|��9�|����U�~�h��w��c����~7�4�&w~�W���DPT	(���������A@�-zzqi���<r�|���?\���7��N��k�g�[x�%A
K}����/���gp?���{&ޞ~�{�%�/?�KåJ�c��*��nGKW����}��X���9�U�g�rԜ��t��Ɣ;�i�����p��Ջw�Ic�s�ӭ��i�F��D�U�.�W+�5����S��K(u����S�7����Xw�ڿ�����1�������S�]��%|�Ga��ޢ�K�^o�^s��>�V��.Yq�R��u�[6e��� �V0r����"~M[յ�ɐ���(<_�A;EP(��hQ�¢>�D؋:�����[5׶�MI+/lKe��N����E�J����>M�`4�O��h�UUsB��w���)�z�|?"�p�W�"���d�/��hoM]?�՘��u�`2&���fƱ"Zܔ <��53������	߾$N����# �M�����r����십g9�b1AI�'�QFߓ�L�%�ctq��㲥@Y��0L�B���Q��̾T�רY�2���rK��s\)��[/�/���O��9���W���F2W�h��80=�l��<�jV��bq~I�ޏJ�r�,���q���f�6z��7n�{t]ļ]�F���{��>4?�0�B!] �EP�_'�������$�Uc���و�1�9��(����]DX�]��i�0
����"6�(B
�Q7�C��߈��,��e��T��ξ�Q��Ʌ��+��0Y�QI��8*���󿵷�(`�	�  �/�?>����Wm�U^��2(�gE��F8�x��A�kv1yY4WLƀ:���Esu=�J%����y���"?��L�8���y<�Mf�i9`6�V��X#M�{K<;���\�A�!Qӄ-�Z������vkJan9�͊�(�c��<1��06�v��f�c�� v�����d�E���	枎��<h0$
c����)�&�W���Ťy�9�넳�6�滑n<9����:�sv��(���SA�ڽr�6��HC�X�(�d${�q9�c��A�Q�OGm<!��F@9�����Y��;���󹽓RdvJu�CӞkC���hg�;!wNl�7 �Hb���\q���b�"�B��?+�l�������X�Q�Q���kl?w���2�e~��O�R�?�\��|!s�:�pDa��G�;iW��GX�'l&���z��G�MkZOmb�3@}З���>��މ�{g8�(� ?�h��� st�(�2��������+b��3��Q_?��q"7��R�Z,Y���I�=9%�
O�쓴������r�JL�
��x�t���Oi4����GS�Z4�����]s3��<�s��
�~JVK���{\�'߲Z&�M�U�طx-!�[!ſ\QK��My�.�����Ee�x
���p��s����~0P��,;�M�a�����ϩ��=��Xv�>�̓s."���B	���gI��e��N�~�D�t�xn�t�̓{V<�ۏ�)�1|�M,E�?�x�S�'�t/0�������X��W�^��&'P��#[sk�"r;3Ӈ�m�5��ʔ6����;��B��Gg���;%Q�Q��Y�X��p&y�A����Ȯ�r�r����+���y�k�����`�R�7�ۗ�ew�ӧyR��_�uS���A�����2�;�6��b1�Z��1=mG��{�>�i����{�ǻ��U�3���=<�?�����W���g:Z��f�ʃYIz�D%x�����P_�rb�0 -Bܥ����������2r^�O�a�IG�3la�S�gi�u�_���f��������k�O#=Vj�W���P�����a>	�x)����xoQ���w�E��8*1!�>�����a��Ԥ �:��Fo�8����0^�KK�:e�ر`W& t��%���xs�ai|E�D�%2Q$�Z9��(����7$V�lM�]C~�l.۷L�� ��6�ue�/�խ6�֠���V��i�:�N���dx�v1)}� ��A�=S����A��o�b��|yp}���������N��������>����u�\tCE6!�
3 �P�d&�D}¯j �"9��Qu}s� �����3��g�G��ђ��x"�hS����4���ɘ̈�:���|�g&cÍկ)�l?Yn݉�X�7�5d�#��r�Z��~�J�*�I��5\$� �\��5ݜ��E�םe���b{ɏE�f��̿�0�s��m��ے����3�N���p_�ߢ�H�@�1}e�=��4*1*����a���_��
T�u�w��hL�k�s�H�	�*�(]��as������|���y��zW��:��9�C)��+7�=�%~��7��=\9f���T@_������T@�}d    ;�	��O%�Ҧ�Ҹ跢������ �H	<\]$�ۆi4����u6ÏH&�s%d�wv�����= !
�&?D��Z�?6]X�z)���A����?�̢Xx��ˇ�����?Gا>�|t�Y]V�Ci֒-�`4O��k�gz�u��Ù6f�E��l�k,��t���֧M��گaů����w E���gA���� �J%S�Թ����Nv�EG������p��qA|i?�1�
�����H
P�_A�����a?��7�*���69��o6@�#Ш�H>K��M�tW<�����������7��qI�V<�H:�w�x�Eیsc��q����{l��	gJ���/�sO��'���?o�
���R㟀O-s2���uw�s�����z$N;I��1�wУ�aZ�`0�%�B-Sa]���1S6$����s'yN;�H:�� š�r{;u�����.&˧{F�MT������TfI��ƻ��E �Η�e
ŧ5�t����j!K�h<J%
$�/CM.(PP���zҒ��j{�Kܩ)�7ӥ�����Z������ҝ���*��Q�5�\�vJ3�0H��&�wB]�`�4�bo/.G�
�@W3�F������{j�j��7kr%�&+%jF�C�^�Z==ҷ��XI���(c��S]��F6���"�OQ��QO��@^��p�GAȇRUz��1�S��������agj'�s{���8��
�Mu�6��z�-�z�`�Yێ}<�ܻ�9�R~2�<��p��AȇQ�4��wAqN�q��.����Ч�rs�=MZ4aQ�ڠ�U�dZ��S�J����( *q��"r'�H��S�.�v���ߞ�}��5a�!M�:6�p_E�Đ��x�Z.ؕ���Ba��CE�?�c%V5{p`G�q?�5�~�e+�_~�	<�Uń��!�ɐz��D���A>h��i��d�#o^#��[�;���H�J%�K8ۏKYPܥ;�A��� ��Z�X�X�ށ$f�9*Kb��x��A��$���	U����׸�hl⛸˱�z��]�"��f��7b��f�k6
���ܜ�Lr��6�`ܙ���j�(�)�<��)�F��0R���z*^��'��,���t�K#5�%���[�]_ͯj궔���b�Ӈ��ݬ%��Z}��;a �,�b${�wb.��RF�B�^>�������V�&�c~��uǎM��Se�SPl��_sà5t�%�+���E	��u���n
y%``&���[X�-̞x�{}���:��ew���{z��b�]O������ݫc�#vT��S"繖��J�ԲH� ��K*�z�g�I��FxI%�bO�%v]��Zk��R�%��F���U̾���;t.y��%0N�E��KKkk��o�M]��fP���6�?�~N�Q��w����/wGN�0$o	�������@P(��)���wϞ�U.6��&� ��LF0������^l��J���o�&\,&�B��q�8y����_r�sVH?o��#tMy{��Z�6ԝ1w3�>��?����6�'�*�]�`O����7(zX����O��z�����f3c����.jw���{�@��*q�L��W��?�����B��n���z�ޑnj�|s��O��m�'}ց����/�}g��� F��;i��2p�u��Ou���0�9�1�:�y�-�:�L'l�m�� Ss���b�R"�J�ey�g�BE���ӡ��Р��M�m =%��sB��@�N���z�A�8�q���U���(�-BB��#��ex���.�R��D(������ODQHOtmK'p��|����k�������q�4�QI>��_����G�,cp�x~m���e����D�r����wr��{��jX^%�oy�P��v����������&�&�V�|�X0~�@ܾ7~\�x�@wq���s�n���a�e!o`��<m*�P�b#11��.6 e
�o͈���t����y���a���y��m6H������F����eM��[�ȿo<���q\Ԉ�t�$)��.#n41�ZR�9��`(���?&�}f�a�"ֽ`�M�~d�_���Ö����5��AG%�Ҿ$��*���z=g_� U�o��oMfDoI1��}���j�~�Ώ�e��Ǉ�J7�4��Ch����Q�}��v��DG2��
@~���p����QV��=���V��_���#�g�Ik0�ӵ��q�j���e�0ap=0d;Zq��B���Q��O�?S8��~è�:C_�Uq���t�7�CN+S%���y��ʡ��Y�NWY��ۇVSڧ�SY��[����C1YBdo����>0���UZR���Pm|Q�ԤhnO��%m�"R��V^-v�=_�ۑ�j|���b
+�0��z�idw�?8��e�"}E��#��\��p��x�|m�@�8�(_!�:h�	�������j<�DmMJ�҅�"х�t��$��a6VX�zs����o0˯E�A �"M��G$�P\�n
��T�L~���#T�*)�k䏪�7�ڌye�0�#����U�hmY�*=L؈���av���W#E#KD�D�"�.(���e����pǦ�Ո�(f�Q�`PG�O�at�L1�>� A1"P�KK��ԙ�V��K# �"s_��'��gni
�Kҕڽ��tAU���K��]���qg���u�V���1X.K�Es;N�fr��]�s*���*��M�d]�>����U�Yۑ��-3�>�l�y��E�0 �x��|e�`��L�8�� �$�8n��=�.��.�u�gW�J^+m[�ng;k�̇��+˄�X/��mW1�c1X�����}#�
�(���A�/�acM��؄��M_�S��4�7ozJ�ݑT*͸�e��x���}:i,k%81d����)�p'���|�M���T���UQ���f7�y�/'�q����r} ���Gm\�Y�(N�ڡ\�(`k�ݛ=�,��uj7�k�}�Zy��v��rm7>��2虳�pAQ|*]��_�8��7:�.�F$�[e�e�oU}⍁���9��ߓ�o��������.$�Q��P,���x��� I���D��ͻCӷ(�;6�T�ه��)b�-���:(���ز�P�04/��aEL�{͵}Ve��(����'�)�B��狁�з�v�[|��6��x�>'M���l�b=]� ]mʰ����d����j6\&ah�@?=S2�P�z���n
�׍������I2��2�->��G%\z ��د��8J ��+�s��v��#��zV;a7D%�"��REZ��)}l�]Ų$L�����T2�ZA�������s���xAY��	�GSC�v�15&�7����,V���~��j��f�ߊd��x�h����)K����4���~��ȩ��Ly�t���3�������q���G"�-M�Qp�}v���dD�ק�oƐOEx���e�ˀG"��9G���?_�"�br �������t�X����2g2�b�^ڌ�xL;���t3LU#u���䦣�8U��0ś�t�wS8�K�?_�G�8˯��<K����9��^���w�1|8��dq^()��a��LKf}?m��j��E����G<9��su;��v�l�S�Nf�E�@�	�zE=�zu�r;{R��N��N]֥C��V��k�Y�,h�NQ�˃E�b�
MH�L�`���N]�lף� �q1�;aߡHI(�h�i�2K>9�.
v���AX�8JdE	p�`r�{�
��o�/w���O�dz���7d�י���ƹ��Q���#�)N:���ޓNK��͹D�S|��x���02�u���n��Ɗ���+��ڸ�U?f!�p$���)��>?C�/(�Lf�%%�Q&�d2�W��3����3�k8L�F�-h��4]SƖ*+f��������X,��ӫ1��PXr���̮����/�$h+��/6�r5���a�آ�}Ȁ ɷ��'
ry0�S�[��Q3�����d�Ap_Hu1��B�K��)� �  ��ηw���x��3�� �6�(?����B�c�g��W�:x}{�%�����f�7Ī�˱n�`����X�]�)�"jk���Ӈzn��K���*�5[��ؾxh22�7�����}�\G2Q��B@΂�ʥ0J�T��*Ԯ�����6�͊��R�o+,���J%b��4c�+�u���C�g�F��V�{Gb�9�NA9��DA2��6�zp.(wQ8���(�l	{�%/�\��ঔ�gC��X,�"Ψ���<mG�º�1�{Z"��6���s�ƽK�Å\�㸽ԙx@17�.!փ㉸(�k*è�i!�6m5����E�'r�`�&50͛9k��w�J-���F�)�OHfJ~�Z4�`�.���[��(fU�(���y��}���VL�"1��u����y�n
v�ۧI$1����Hq�l���Y�K�)@��$�TY��'I��᪓%��q	��JA�z)�����\9�1����d��ɖV�b�I��qq4&{���t�Nf{f�h7�\F2���<���E	b
d���g��(���R�v��x�-��5򨨫��ɩ��әSo��qk�i�4��V�2=�8I6�Į�_ɍ��XTlE��5�Q��ݎ� �H��9ޢ|�M�x!p`���6����"n*��)WtI����'Ɔ)�d�����2�����.v���MA�x)���sc�rE�cSQ�����a�m����RyR��I�t�ƍ�^7�tWmH�d2Q�8�!>�S(��Axz�n
�/U����Y.X����cy���K��b�=�>s�ʒ}�t�%p��vʗT;ى�B���h���%"n۱�L�d��ˀD��v��g�G�\�d>��a�9]�b
����E�춬��m}�.c�z,�Nv��>�M��qkD��He�tf��x�3~}����;H1{�Àg
��Q�0��x�-��A�����T%y@KU�>���j��ƍ���5c�d�m���wjGb�CH�%�M�@4�J#�/ �Т~���)�?��m|���ƥXq/�rtS���t�ڵ�ͥX�4ZU�Q�]���a۸t�]J�4$�m�M�`�*�È�O�NWUO]c/:]���^��F�p�+��B�d2�V�0,������F�� Q��v��_`�Wa�I,N�(T���",�"��3t�ˡ�"��:M{�~����b?����m�Y��Z�f�Xv҃š�OҲҟ�;�P�(����A�=/��`�"q�:��P��{.�^GiI�����~F;K:�G+PO�j��C��F/'�ᱞH�N��:�(�4�%��{��*?�2� ��$�AYD9� �6n!�E/�]�O��B�W,�_/�1*�S��R��k�$Z=���򮳠q�N�_�=���K
#�g� q�*l�ñ/�ic������7�w���HV鎋���16��X����Tt�!�å�̲����_�bO�X�K��wD��M�`�{��1-9�X���q�#��ǁ��T��C��7���֘5��Eq�������c�9٥SZׯc�bO��}�(
�5sĂ�
��ܓ�,(�<�0��~�wz��wz^"_5ڵZ>�m�d�Mv�B#)Y��V��H����A�4��Z7�W1�ːW�)���M�#�ҷ���#��}�@9�RjnŃ�m���d�g���L�ߜ�R��tu܎��Z��V�ƎUV��Lv2X����Z9��F��XT,`�&q�JW�<+��:nq���0���,��ne�ɪs��^JW챤��D_J��K�2.�A�tX�F}�3�mi�;�Q� o����^��\Y�;� ίױ�x�tsW�qX͎',�]�e؜l:y�P�ʤ^je���q���F�c� �g�ҕ#I���?#�p �`Y^�rx5@�r�� ��qo����:;�T�T���T�ن�zmV)/�������>�s�rGI�z6g��rѱ���<><�ny�` ��?uM�����B�wM��*�xKQ�/C<��9G��b,�X���W1��l��s/�(,�EV&}s)��dm�K�d���M�)p�n�ٱX�d>���o*�	�

8�\�A!BB@n�H1Y�@^��[��dl�UJ��5���m��!�(�b�n�7=����H�c��ϐ;����X���{�_P8�㿐�Z�蝿��V����}�����勵����U_wG����FQqF|70��ԉ��S˱Ů����'�,J���ۍ�o��q{�I�G��������-�����{���iy�y��OB����.��	�G�]��6�mr�o��l�kx�;K6�Q$⿣�'$R1�"�����K_6�ƺ�˦3$�[�2os�ӿ���O���P?K�#��_��������[����
S���Q����܎έ�$�K�Vu9�֖/���t�y���?�;��'��Oğ��q�_��+�+�r�q�-����Y�)�J\%�oA�O˹8��a�����hmG{^����of�߿Cbį��O	���?��#����3��bf�{��?���zB���蓨Ľ仿9ѧR ƀ�9��z[��� �]@Թ���6{ַk����͝]o�0���-�P
-\N$
Z'��-~��82?���٪s�MC�������7��X��������q�jL
_�ד,�qm��gc����˳�xB��T(��&�%��dE�K�NgUS��:l_�@����=�������K����W52ŐV�s���K�'��EbH���a�Xeu2�`�Y���	s�V��bVpB�q�Ȩ�8~���7U#s]ㅢ�f�A�� �7ǒ'(r1-
���#_ۜFmC�י�Z�.��0����5����Zk��Mk���������U��W�;�0y�O��sH�����m ��,��V��ӱ�W��`�p����D��D�6#r���4P�����F-�q�!O��s��7��|�ܢ�����xq�F �4k!�%�:
�2�����v�z�z�E�999� Q���U�����G�D�T(>�|��           x���Qn�0D��S�	DJ��"'@��Z!@�
�t�ۗ
�*��� 	���Ύ4��z6N,2���&b��4D̂ƻ˿������vx��k;�v��8�����߿�P�H�*I*�a���U\��UZ�� F?A%-4�4���(X����V�F`��@ �OM�ŋ�!)o59da	�f�D�yk� Y[�)��B4xJ ��X+�,Y�=>�5��=h�;1�d�}e�2�E����Ά�R*��D����%<5��T�Q���/<*I�y,Hm�Ƙ����r���o�:���Ί��w������]8E�ہ��z����p*��fҩ��D�
i��Λ$��Y��m��L3�#ر?�u��(�"r�V�^Y�f�^�
�B��2�V6���u�@2t�B%���U�X���N�L�K�O z�K�[[���nEV;�6WKK���ѩ�4�X��9k7�p���l?`&�ֳ�ڒů3dPn�FR�|�*��������K��      K      x������ � �      G      x������ � �      E      x������ � �      M      x������ � �      I      x������ � �      C      x������ � �      Y      x������ � �            x�ܝ뒢J��?����4�#�|ED@�x#�3���տU8k?3�r���{�阈����uVe�3++�����Ÿ-��i��q2�Uj��~�b*e�E���.�����!YU5�����t��Bˏ��ʽY���m9���hC�^ ��bP����M�Ƹ�j��yתD(�Z�Q�]�$���7��o������,�!�e��;�@�,���_P��$�%$����ĸ�"��_����R9U�>Sa+����jC���%�ְ�X�������=���/SX��j4�'T�?����*�
}�JM彡J�S�E�r%��Qk4tu���ms:��ue-���L�'�~�
���H*�=*�5���BF���t>��ӆ����׸�zյ��jv���RW��JQ�0AE��P�2�H�HP��Q�/��w�jl�U������.-lLw��H�Q�7����b6��!a_��e�Jd�J�?CE˒D�@�-*?|EE�w3�:_G�j��9�Z�Z`����YK՚|��j�JN�}'����g��
�e�ו��=��~�Q�ݯ����k`$�ֹfĉ�Uj�[_&��٥�`����E�n_�R�!�2* }+~��ε�WDZi#m����t��v�So��]��	3�h,� �3w����,ʀQYzX�;�XU�N�7Xws�Z�3�^]��݈�������O")Х��S�/a��"I�B2�����j��X�<�Y3�l0�!�Β�
�˝���9^i�ּ��[	��%�Ͱ�#0�忴V��Z����u�U�;'��S�����ӡgi�����YŢn�Kb��2߱������X�v-7y�kͻ4ޤ��}Y����_�5Ѯ��v�T@����Q͚�K���2���������X�\��Ҹ%��r[�l�_s4�^P8�%�)A��^�Ũ�_��1����߇�O�3CʌR�|C{���W���In��q[WzK_Z�J�r�vxz�������[�lɼOu"g"�0��\�7ć��^b����1�4Z��2����U4o|���ofSm�H'�R�4�Ԋ,V�D������ �q%���X�mZ`�ݦ'|K�5��z���F�p2r�9:Cg>�sLVS�+X��2�B0����V�, Ǻ��ܧ��UZ�u<q�����;��r�k����զ����п}����R0V��a}C}�/�eR�3Q��>V^������^w
M�O��
ϻU80`En�qx�z=_M�����2��a���ÂV�%��IT�����𭨚�N�e�Pg9���fuW��춟���p��;wm�J�G��P`PV���h����/$VH�e�"Rߡ�,a*ed���(��s���-:�� F�eo�^���t{9�� 5;ӳ�Ç�wHl�ߑ�/����p�d1%d�f^A���m��0�ϼ�]Uov���y�Cߵ��u;�`4PvM�{4�M��^[����9�ɀR:������_N�J�K���O�ľ�<�.����zv�N5zB��\UᷦY[�p�&ѩ��ΆƱ>lV����<�+�C�d�N�(��4�'�(��?��R���G"���p�V5N������)�mȸ{��`sܩ�v���Z��F��;��bڀE�k��J��?	wsQ��%����ܜ�'��𭛣Lmx�ט��.�M��I��Ǻ�Λ�e���@v��O��� �'�?%V��,=��U� 	 �ȓp��U����^.�P�B�;�u��7��[<n���ǧMm2�{,�ޒ�e�I�(�$g�T
�A�s��y�s����l��/�Q2����t�$2������Ծo�,�W��,S���X�I� Q�c���A �w�)��q�6��
�l�J���lY�nK��\�m�?����<���i;�ᾍ�%��cCՁK�����$����m��Ӵzl�ऻ&����|���voj+�1 ��ŕܛ����A�'���� �{����k�Ԫ>�_�����M�Fz���>֤���Fp��t��K�J��T>��3�����O�D�)��>PAU �B�|�Ɓ�Iߟ�щ�D�l�Ie�ݮ�K�l��T�k�j��pr�Xi}p��[���X*#	+���
��r{i�/{�qÛ�,Uc"iáaA7��:5��e8�w��۩eo� ���\&I,�9��8���ϩ$���)Wa�nh����Tc[�Ht�e���l㙖y`H����T�3
 T�h�֋�����)3*�4���@P\<���>l�h[�N�F�rؽ2�8`8�`�#�I��\��8��0;+�\#��!*buY"[�n�6���[)W���z"G]n/��F"�^˲<;UQ5��+��V�Lg6���NI.�d�cP�%1QA5��ϭ1��kL�J��y�g-/0��),���L T�z���չ���3�q(¹�P��zH�?�� D�?p�MY�
�<�]u��V��L�C����q����m%^)l:U��גm��}ˉd;AB0̏`Z&�A�gj�����|N����997�F'L}����z�> mv�F�����fV����i}fXN���C
� 凸aư,���c6���^���w��uȶIZ�R};+i����GS:ޛ�>I�a�ͺ�)�6#�}
�@�`�˃2�je�)�?p�}>���|1��xy;�}z��u����x��+�ɱ{����
Z�#ڂ�u���� X.SI����C|5c��K��J�V��2l�v�옻�I�p2��fW���9+�?�1�_��e�+}��}�2`LVr�\"p��ĉ�\X�p���:�E��퉒�#���;t�#�u�,k�A�ΗW��8l��5�������G�D�"����e�!��"P�2��;��bȩZ���NK���a�����f���/	qj��i�����:��&��FT���M�!'bB��>~(2C�Dd��H���Z=�������a�v�����xݚ.*��zov&������ǑF��eg|Ī�$Ѳ"b\�i���r�$���E%������A��������AMKF3i4���k����y|?}7�8�Wf��H��"��H ��L$/%�)���$k?��YF�{J[�PۭZ��F��H�&�v�f�輭�}cV��/�G�@hB��r�z��wOܶ���
��)��r9�+}^��HE�oW�b{ZF#tM�Y���z2)��`�v*��x�[�Z���_��<��@��{\
8;���R��0!׌ ���%=x""�A��RT/
`l>�dK�5T̂��iZ��T;-��v�m>9�a�[~i|4��Ԑ������'3͍pa�����?Hѽ��Z|�}�~��H���~�������^�J!<�o�iG��=����i^�w67q��Oq�O	�D�L�Dz�֕�c2�󹨐���� 	^Kz�-ZȭDw��7�ހ��+�ݮ�`yk'whT�V��Q�	�~����g1"Y~����ڀ�{�]i>�v��~��ؒ���&_c��Ws�v�,��搱�(-s��ք�(ѠB	<)"��
��E�N�ru��B9񊫦w�7��/m!��]2���M����^7�N�)lW.������a�<% f�C�PL
b��~��!�5�sI�pG|�}_��C��y�ۤ��]������w�ń���a�ٶ�n=���%��EPʳy1e�`�=-��� Vl�9���۸�_�Ii`��݄�}:�NG#$m��(h�C֞���\����L��a KO�([����)������9�K8 o��e��57z�IH�Q�{�L}�:M�ݤ�hTW�v��F{��C�wKXa�_��'b,U�)�
�A�n�\*Y�]}��V��ڸ>�'a�|"��6s�Q�U�ɵ��2��H�\�K�F���\����z�NMn9X���eD�R4֕�*~aݐ�]�CknZ�3��C����~:�3M?m�jg[S�C�
��8h�`Y�!\�"��Ou���Z�g�����ľ��������l���KG�z[w�m�k%f���z�F���J�o����s�2��

C�P6 S�YEU'��?��    ��Y�A0�ޱ1�&�1k�L�m��m�?S��ė�{\UJ���7�d�(�E�?_�ΧO�JUߧO��{�.᭷��t��U�Ńy2�!�W�d���4lς�}���WT��?�d���P��ME"�e�g�sx�����ކw�Ҭ('o�ov2�O�{�]w�fEZK�f�ٜ��k��/|�#�KTEI e����'34ͧ������J��wg=̷�x��ju=f�H�O��^u�{u�^G����$�!׿<.y�w��r�,�dg����a>�������R�<�]��b�GSc�;�Y�J�����{��{�v8�9��!�� ����?�A�$�O��e�;آ��Ҁ���3��V�v��\斶]��0|�@�-��q��^��NZ��	{�>��W�R��KE�6~6�"vP�%������&n��1q��#M��	.�Ѫ�o��x<��&���Գ';�Y]D&(}�fP\������iᲤ0��rQ	�f%�y��y��+��h��ڊ6в�j��c��u�tQ֍h5�v_V��~;}�ˡ�,ʰ$�<��GR�b�C..W�d�NX-��ӷr0�'}Z%5�Dt+h�k�ji�8��v�'�m'3�6�H*bD�AF��H�������\|G�@������Tּ�	^���#�z���(�î��9�+����U0�˕��7��<Wz�q1ip(C��g^9�^�$(�rq5��i�=��~��Y�Tv��a���߼��Ng�Pv��O�h�bڝI�S�9��_�Vd���y3w�|��[\
�|E���W��vÈ|�rR&���!���o���=���b�%���.�C\ŃTQ��w��"�ub��Xq�����\��q�U�.]ř�h�]�m�p5oF�7V�9�Ҷ�Qϲ���Y���'KW�jD�B��"?�6���#x@��J#U����Cv�o��*�b���e)kz���2�Z��6kݪܚ�u��c-l����oD�(NR x�K���`L����eE�髉���pmnۋ1�Z�E�\R�[�������zg��L��i�fm���&rv�� �1|-_�rO�C.n\���OE�[?5<-A��j(��ow�9�����+�uPت^�J�]2yN��6n�2WDd�+v�)�d�a�� b�|����M��̈)���=t.�<5���> 販<�W��]_Og��Ը�$�&�
f�="=����W�����O�s����+�lw��h��ku�Vc�ެ�z&9�îQ�1���~n��yE�)3�)�yB�cʨ�o(�>�S}����Sm��eܯ��Nts����������v�}�_���-������\9!�1@�yEm<�c� ��}CdD/����|N�l�m)�]���n]�F��*���������:����ܾ��CJ ʪa�7��<_�`E��wG�j`/�u�C�+�u�:0q�2H�X+1k|�����7`��}`�g��I�-�2�j����}}1��ݛ�"�M�Y@����t�تY��b�Gz�~�<f!w�<��$�Wb�R	�+�pS=}n"x��7A'�Θ�Jz�hٖ�L��hk�z�j�_j�<��;�����!������]����M���i���ޗ��P�<��y��CQ Z��=u�3wnph�:�&�k�F������j�D�$�a��yԭcY���H����*���Ͽ�̰1ۜ�Eknϧ%��8:yd��{Q'�{�s<����K���R��c�&~"���3F�����=�/�pu�^k��jS)�V*���{x�G%�V4����py���J�Sn�V)I`�)  r��y�N ���PS#}���Mi?x[{t�CtJ��
�ш���D.`|h��>�t�����;l��sq�=1T ��311B�P.!�K&Q㟻� ����h�f��w��Diܡl�'��9	9��٤z���/,bBD!&� ��W�K|�0�(�R|GJb�wɪ���x'��TQ�Ɋ���.>�Ԏ��ޥ��0����T�T�lY������a�Ñ0���8��������*N-�bK�i�;�l0eκyl���7F�l-+K�hߖ��j��%�M3�
�(��!2b��LxP(b����N�d����5���:�Q$��nm��Ȭ_v��n�}�Eɶ{���%b*�x�y�췠�,�'<��W�)WH��T��z�j2�S�8����n�E[ Ǔjt�8����LKu�U�}��X�X�Ԥ2x�[H܃(c�d�x�"u����5s�����q��<56��Ͷ�K|h�IG�A)���>��G��bq&�=5��Cn�d囈�_?�o���\��q��S��e{F��%�\e('IZ��ݼ^��t�4v�`(/��t�5��W&K�=�?*��2N�5�r��������٤5�N��ɥ~�mi�OBFm ����\ߪ�Km�%bY�0"�g_M�pj��oH������{/�[��Z]��v��Q}�����J	<����_lu��K�yƲ��E�b"�A�1'���ȋ�
��X�k*���Z�)��)U�@�ֶլMO؏@s��6F�\c_ڝ{� ��D�]d�.� ��%kq��kS�!��t[��hX	�4��/�uu4�^�����\\vI�Ix�G�L;3qF��XTZe���tov�/�1^}������Cl��t��I$��[{�k�Bvjhm�˕Ǽ���!\Zq;ʈB��**��4L��Mt�y����*�vb�Wd�]-I��z?ZW� �J��u����E�*Gv��!�4��!�(bvO��ع{����[�;��Ng�'��$�ݪ�Vh{fe��R��^8l��E{$q
_f��2�!q$M�$�-
k�����OY�^�gqG-���T��i(��3\��*���U�?�%��BO���c��tw2�0�)P�C@Li����9tQ!��ÛU�Y8�����­���Jm3r��;`�}MCv�]��xg�'�朥��Q���8�\u<��,�
}$q�2[�E�G�s�<� o�̃���VW��GQ��^�;���J/�-�O�̴O�א8��P
(X�ս����h�ЉvD��tۆ1+��t<���m�G���*��i_߰}Gӆ������a5�x*cĭ��f�GV�bUUA9�^���^�/V��y'�ذ��S����F^ͯ�խ/���r:�暍n�52����Xb!g N�M{���+��'T.����� ���Ck6(Y-�D�kx3���4��kW6������>�b����X$
!�ьmH,�^4�h���'l�I+q�>���e�'��ݜ��TU�5m:�U#���盐��db�%D��>����2.���I�:����:m7ܷa�n�q{��Sg�,{�y9�u�����}�ً]#Cʊ�ˈ0q��iH��?'v���9�J}q��i���q�T�r��f�����aӟ������9�����a�>}��2$�����~Y%`e��8-7}QZ�E���/�fBX7�]zB"��\n���J��^�~Xm��f�5kL��Sݑ�\�ቄ�vm�o2�%�!�ZH��Vb�01��vr��䝓��r�a;����;Ǒ�N�!��åQ�������P�;������
���5� �'2���=V=�X	����Æ�'E�:��u�<�.���I��ۼ��Y������~lJ�Uq�+�L�ř��q!�r��k��^�"���zU~����Ξ{���<�0��<n^W��<���vZN�t�WW���ŷ>5�O�G������OCM��T">����\+=�A5��P�02ajI�ii�`�}k[V��j��8�`u����)5����
f<:��+�4灑������yu���0�:��2ֺ�tVժ������$�'�}��p�z�Ð0��4-�R�*�Έ0��s�\���.�ys^���Z�&ѡ��\<�(���>�Ɨxt[M��y^o0�Ԝ���*IF��<�1�	�0��vs��<��5y�x���9]*�3���z���!�:�;�ﭙ.�c9����be�0�*Q��8]    �_FF��_F��\�fkjϰu�k�+���q/Rns�7LF�N���Л��k����e,��6yt��8ȄsC>��}.B-�ߟ,W�ڥ�i`yn����02Wh�P�v8�ۅ�_�;�)���g��"<���H~VPD�8��IC*�����ۋp@��~�0��0���4�[����:1����<t�z힊���������xT�  ��i����
|��&s'��p���}�<w�nc������4ة���5k��f !�xzRH��g�y��@�5���۠�w5�DV�op�V����z�䣡<w/p����>�a�bme����?Z��^�y��`�3>u[$��/C���eM�#Y�R�xy�\�Z��W��WֶS.���n�Q&�5�8��������]�l�\W�Ǻף}�|L-�@T���׹!���?A͊
����ድ���=��zf�ao�f��X��e�VHG{��i�V����eA
���;㿛H��9��GU���"��v�|[�̍@O�Q��U�K���[R�J�[e�Շ���r6R$�Oy�ݼ�!`����}�2�:�����-�h�f�k���\���ۿ�Ⱥ�2wA@\WW�������쫽o'�D�|S���PD*#Yy�\��oΰ�+£������?w��z��!�]���*��ٳ�`�CjՌ��K�zvQ*��W�� ������o�o��F|iv:�t9��*PK�\ڎ���S�"�����اd3�l�$)���ע�\.�D�����pd�1r��U�v�x�.hrN���Ҷm�hwZw��)O=2T;���}��q!\�T��f�,.S�EA'��KAO�6�l5A���*�����x��t�^�u_���������\:dOP����H�P$aH��>�Em�L
��ڷ�K�Y��z�{V}[��"�[֊��_�ݢ�(�N�b�;�_�p�zԨp�k������Kߟ���pz���3���2����1���������jR��|��_-#������p�k�\�-�e]4m2�wY�G7m:9���,hԯ�*\�Or��\���H�rY6g���d=�8.%?�
w�����yq#�о7�/�h�m�a��n�XT���̨u�W�6-b�@��W���ɸ�QD6RI��d����b|6Y ̈ޚLolZ��zW�����	I/H�NwS;���ڑZz�~����Dq���1���
������9Z��/f\��o��R��6ˣ�]�ɜi����RB6�e���K��r)���t5g��Ey\�R��?<��ަ�	�3rࢉ�M6��+=:������zE�M��qk(��������)<6PcȌ�P͏�ɵ>���ץTZF���U*��H�an錻hz�sG/
?�$�A�A^�k�Zt���J�s�
KQc�����Nw:��T]ަ��~j��(\悛���X�E���j�Yn>��6��c�"�[>D� ���̮S�&r������`Nŗ9����!�u���.�>����\�c�`z+́Zo+�ڰW�u���k����������u*�Y����Jvp�0���i�_��!���ʣ?��i��QM^�e��m��O�p�h����^�Ëj����i��B(�_</_,�ss�&�qQA$�a�{���wqiҥ$-=�^wj�'�i����Ê������=���|
��X�=Oc����C���A\���z�e��7-wn�G�%GoM��j���\���zT�q�0�sIVc0Z_��Bg2����P�y1J2�*Jp�|������n�=���윤��ߖ��v�{�j���G�t6�խaTZSR���Tܘ
�07��[��RBpQm%�I��,���-g'�$�����hQ=Jڰ�5�V�s}Q�&�8��*;t���γ���!�Ie�D��H�'��Gl/�J�8���~>��-�zn���f�V{���9lt�����u�B�aG���&X�H*\��<D�mIƈ"Θ�7t������;�yn�F�im���3�����Rj���:�i�����o��2�7�r-2�1~��ͣwYpÂ�n�-�n^p��W�ϙ�~�>��S�݅�d_�5�Ͱ���hz�8|s.љ�nC��$�W�ʪ�E��ʱ�!���y�_�T��=�᤽O-�1��d�0��ֺ*Co��Ϡ_�����̂J���7�BH�̂_%��[�s�����`ƋZ��Ӡ�����ik�%���ǃ�k:�>l&�7����>YIi�0��S�<D����%�����E�ȁ�b~�F�F�u[���:�����u�G>�,:<�h5���>�ŠDD�bIB�C,�� 0I8�o(�8}���#�]�\���sі��Lg2���T�Flo���wߨ�g��w⌊�`����E��\f�l��K	^)�r����[j�֗auS�7���j�8���n\��~m9Y/5��Qmt�8dȨ *3�<����2"��V=	`��C��u���ݬ/d5�W��x��X���Ws���m���p���a<�;�Q���X��\=���d<z��+F��T���H��O� ,g�r�� ٴ�?>v�}�+>�������D<'����#T,dC��,�2=�ͷ��x߷����W�]ب���(�B]P�����^�N|�m:*�+̌*k0�(��,�*L��!
w%V��};��r��t��3'�VKW��^���i���z�.��R�;|�-ѯU�x����P��$�#b%n���گ4V�o9؝Kn�UF�`��S �c�1g�+��o��}=ܠ���qF������!�nQHÁ��+_/�cѰ���<���i{%N����(r��7��j���'���*Z�1��̍��6.��|�_�Zg�Uh��Mݞ*���vI�h��3MYٳ�!��k�c�+�CP)eD�7'��ۣ��g��������]}>M	�S5���)�Lð>��
���'�c�d�~
������sv��Xo~��gPƊ�"�3.�H0Lx`p�Mݕ�%��~���eD��6�^�o^h��R��M�AzN�Ԭi���������-�@�'��2 d>�Z\&�*��e��_����(ZK�Y��"�����V+�}ؽԑ>���y�.9��s�l6�tcLyvEdo�"(3�s���E�W�
i��
�{�-�d�o��a̜ks�I���}���C�7�awH�n��.�<��޹��pE�ur�2�:9[�o���C-/�����ݸ��n��[������'y����W�e�`��м��"U&	���E�ˁ_�����]�;��Z4��W{;�V�I�ێP�������_P({g��_�_&R�U\'sn'׷,��ou�i��@[8��|�l�:$��Q��{fo��ݻ������_wUXԛ�{�UɅSqv5��s�Z��~RjKm��^��n�z1�YK��
W���I7��?��>�K��[��W�@��N��P4R���P�|Z�b���D��:��G�u"���8�c��]� ��Z*��g�����\�Ο��Qq���4�~?5z guǄ�u��0��(�Z� �߿ֱ�w���T\�mɛO�͉���.�KPk)Wm�y�����:$��ߋM�!�D�zą��]���}���}�}���&kk[�İ���ɥ��L�������m�I:��6mF%�Ȍ+cLu��M.�i�~��iFz�J�\s�MJ~ڜ7W�{�t%�6vfkbv[�4�O�C.q]T{)��o0Z�&��Œ��N9Xx{q����-��i\Z\zM�?�`�W��qt��9�딬:�>�����*9�'_���ĕaQ�)_Ċ�n;�n���9��߾k�y��w4��#uCOve�s�U�4�,O����z�nm�Y�׿�.>H���6�2f�"��e�[��=��q�x25oo�]�����|>����7����ꌏ�%�F�|�H���s���8�c��Opg7K����9C�ӂ��ې�ϋ���:9j���}W�Tl	��=�Eu�<�{cy6n߫�^_O�R:��fM�(Q$�KM(�    ������	0������D�+���7�������f��`��g _Wݰw9N*��70֟�*�5()�y���"��H��w.�b������+ʋ�#����K��r85X�f���-�wMKg�>M[�i_:�ͯ�(���墘�g����@
��7�c��:m6�_\�̓ϢƢ�-�9���Jܬ��ZegiW��Lft�K�D���]}��Td�9e4�Ϭ�a}��;��x��_}U	o��,�/p�p*!� ��f����ɮ��������x\��X�4
~��N��/�.���'X��qa4¥r	׵<8���Q�	L���Ș-�;��>���AI�~���74����-\'��"W*��Q%�JY���r��]Z�������&�K�
��5X�����U�e�'��$��CPVc�!/ږB�'���6��';�����t6����ar5T��&�J]��6�K��5k��ѿ�dOt`�>K��%qLQv�p7y���	���pC,3o9
�b�v_�,J��u<ٝ��~S��7[S�{vM/��H�4!��c��(*�^twT��;��1��=6�l0i(��G���N�V��0:1�����Xa_0'�z<1"1�y�U�|�e%�ǅ�Ov��|>��ޜ� �ڟ�]\�닑3X���J{o�o�=-Z�|����U�+���N���-�"|VP������ד�;�p�k��m��2�/�d�����b�U��8���.=o�RxJ̭dN�9D���,��D1:�ȯ�|�;�|�V��hٚ�NN��J���L���u2�<�\�Ǎ���}�57�Nmi��`UQ�+��Q}ލ�{���>���V�O� �� -�N��>�7-���ŵ[����	m�Q=����`��{_��DD�\1"�I��5̣|L T8q��oH�B�_�>/��J�1�;렱��踚i��Ȯ��B�Y�����3:B�b�<$���/T.s]����������kޥ]9�窴��ꇋ�%��d�b�ZYy������$�^���|�凲���y(P�a��~�Ou�ɧ��m�_�ksڮ����������~���������[So��Ev��Yv�E�c���f��ˀ�|�;����b�L6u���d{�L�����o���M��V֩�D�>�}'��[���ED���Я�J�K����`U�Kzq 0j�n�V�T4��A�����6�׸v\�0�Ss�VĢ������s-��(<W�!+\���V<-�с�jԱW�u~gS}b�1jt�4N��vTӃ<��
�փ�W�`����/K��D�8���J�����}����}���k�F�83�0I(���n���lI̻$��&�Y��w��g�u���J"��OV��}���R�`|uZ��k�z�[����u��8J�
�����p���=p��'ͯ�g��e�@��X�-ND0Td��i}�埑��gd��w/��ؐ�	\�G�1IWz�~_��S-ZL;���=eƚ	��Sq�A!0G-��@F"R�TTֳ��J�R�y)鬴o�N�r1����������@Yn�a�������1uv<@1�X����������v>�����m�ֱUQ���O���v����I�`��-mz�@W���U%��H�ڇ�?7��C=P�������\�����ZE��٠�H�OCB���^ƨ��;�}8��k��2�����xvS���P�F�*+���q�����h�C󶪫�z��u[��w�
SQ|>x'����Ku}J�n�A?�T���e	E�����is}
4������Pe���Ђ[����N. ���2r�s4�4����1C���$E�#Yj��n�0��F�&J��ѮZ���n��Խ��|L}��7��>`�P��+��r��Ժ����'�E�Fe}��0���������n��j�������Oo����%o{)ŞIT�@U�]<c�ͨ��Z�~W�&J�sC����*���A������4�]3� �_�+�����K�J��*(�ʹXύ�n|�uJB�Q	>�T�(>#���Q�}��ƶ�8��k�sz���F�S�^�gq�֭�	�K��4�Ox���(�W���Ǜ�C~@P���h��OR	��U�*�f�3��Þ�ׇ�Q�vK�r|�l�}{��:޻�j��ο΄� �b����b�\kR�lAa��������&���$H0cW��Ms:`d��Y<:'��u�Z��>�7V׈l������!$�=��_�o ��  _�I���^}����2?����ŧ����NvcT��&[��6��e�q��ם=�2���e%_�������?�s*�~q5���cǐ�8W��mlzι_���.u���[�k�]M��~^�FY�[R����8_ ��H���S�۟��G�O΃�`6����<JXg��k��<��7�߯5*��6������tJA����~]���)%���spQ������E�I��ܚ�x��t��=;�U���q�Km�����A ,˄0�=e�V$��Ņ[�?�˹�� �^4ȃ��̷����ۘ�W�L���e��\/�3N�3�+�Y����8`�m(��x|X��;��L�
rx� �|���|2l�F#Z_h�K%�?3��c�2p�bU-���Tm�@�ʈJ�y({jC���/\����z����s{N�#�h&#{�5�a�F�}W	��~�.�vڀ�;ڗ*�*�|P����G�
�Su��SXtӕ	��[��ppd�J:x|�$#Pi�Q�q����7�+Y�Lm�Jұ��mH�/'��ɒ�#�K˄�GR~#G8�4_�"�w�fyat00.���Ǥ�W#�L�؜��Kg�7/��Ꮏⶳ�l ��������,��]��|B/����OR[6�;^�]�����~В����g���<��>	� .�����`-C��h��&���_��~�Q5K��V�תcy��3��y�:fS�Զ5�����>���Wܰx��dQ�=��Ë��7&��ޑ�B�N��nw�'������h2ݟ��$�m�]���!��=ZP�g��OC�q˞b y�P���h��O_��)��Gbv�P6N�j�~-���j�
��nI�����v�8��0����B<��{Q�c({pX4��G&���iH�ܙ��ƪ��J�WaR�,cGKkU	�ļ�	��
��څ����쪍X��嶎>&�'D��ɐ)�!*���g� /z�ɣۋ��ɍ��'�y���|_k��y�3x �l�h;���gu}���}�����%����b}�����A4��P.n�(�_?�֋��yc_f��_OM�:����2��麄��+�v��le{�k��ƗȳK3P�6~Q�g�%�o�?D��N�2��~�-����:�ѹ]������;�����f����p���~pq���%�4$��S���� T�ak�ɵ��|���y��u�R]��p�mw�j�	Pk�;��;Z��c�ƽrMݦ_�5�JQ��#�������$/�]��|�[>��v=���m�݅Z3�}�W&��Q:��J�N~}\?{��KĲ(�aܔ�y]�*� c��m�⶞'�P�Y�C�ß��J}*5���P�뵥Uw�.��.k���.H���9�ݾB.�|HV����aD�X$r%�'���qZ�=Q�GS�Ct���?ϼ��1�����@X^_7����j�I�*5�sr���|��#f(�
^��-�P��q���m*=�q?>4{U���}O��e��Hw<�[C���Ss`vG�7�^�MfT�
���g{BEt�ÊDŦ\���8a�|�>��Io�4��+��zUj�eD��sg8��J�q�,_Jl�3dI�>9���At3ni��z��𑃔���W��%��z�%�|,�p�Q�nO$�Ξ��u�5�6�MCS7��d��-�_���}����=�(�A-�:b����%�f*Ż��v�%�J@Nz�BRxZ�T��s��D_��h�N�MMXx�O����sn)�]� x�ˢ	I���H�yy���L�X��qtDh�N{�VŕT�e�ۅ�q��gΠ>����I�    Gѥ2A��GT��V	8l��
8��>�>����`�H��ɝv��gʹ� 2����i�S2�}'�m*e���+�X=���)#����ͨ�m�}��X���&�����^��Ʌ�	�_�so0�N/�b�v)E�*0P�G�S��^�����T�p��b�{-d'.�1l�!��pdZ2��,���g��Ӳ{�	�Ce��zd���"+25T�h�sw+�q`.�o�T�w���z�V�u��C\I&'y��g�3������d�sn�ʔ�<V}�Ee�P � �ES��;�w�����p����6�`&�'��'�fu>�dkp�N�:ش��f8W]��H�2�����������a� 0z�8p��5�&xrWA;�:���>���[c�]=%��o�v��c�������ĭr� (=Op(���b�-�8_��履y�݀�K�b�n(�6"��&��'��l`N���^� ����0{9Sb�7�rr�ILp���M�]n��C��ݤVC�.L�Co��⫷�~�-ڷi/a��V����;���d��� ���pѪ2�mݭ\U��v_�~���v����<�v%���$�e]Wg����#�=���_ �ŝFH���b�|Pd"���E;h�WE*��Tr����l�[O���Z���1:���F�h=#�N��*�L�l~��Y�
! �ܐ"~$|
`qΉ���e�/����6�Hյ��֠���:M'ZN:Fw��-�E�Q_�v�q����,��N����(�b��,4�hu� ~ѡW ��Л7�4'Ӆ��a���Yb�����ݬ�����}��?�~tx仱����S��㜻h�q��Af�/�A�f�E{�7��r�Z��X5����.�����2x����T����F�CY)�Z�M�7��v.9CD�ə��逬&�Rw�z6��j��j�E���� \j�:���0�%���n��a�BT�<����Т���%�04�$zۦ��|9�z��lI,���Ji�F0JBuɷ��A�/,l�ѓ�@�U?�b2�d�-F��E�
���~`��R���܊���0ecY]Ո-^w*Ɓ���V��/xpG�
��9�]���D��E��ع�:�G�'ڞy����tZۭ��[�ڙt��pԳ+^�$��yJ���K�"����y�e��%$��w���n���s[�pt�'wm4\��\�l�Ϛ��f����J��ڜT�&>��}��5��0{��ʔ=�q��e5��h�Z܏���­�?%��ҾmKQd�����/`����PPT�"�CQTPQ������2��M�=ztEW���Zs��b�3�ȼ9j/��Ns9+�(Q;�0NʯW�.S���=CT��~�b-���7mA�*�(�w���_���k�A�X��[o��t!=��S���ϡ�a�&�]�@;А�P:i� ��DŪ�2�����3x��n�;��8>�'w^�ZOa8]��3�o�-o9��	��!6*	'��acZ7�U�	�_�,�J�Y���	��~"�8�@�� qoz\�h2��N.��\�֞��Ct���=�¸X��1d�}7� ���(-��~��t�
�`%�L�)�{��4]��������s_={���~p��NS����.Z�9z��$����X�"i��@��4"��G{0�g��0ף�NOt����-�v|���,8�M�<a�҈b�_P*�\��ҕ�U_%|7d�Rk˟���^�<��8�G�ӿ����!�N|��A2�\^�%��ws��a�fݎ"�,ϐ��5{����&�mW�l�qw��?~l
kf���<X�İUa�5���y�p���1F���?���!���� �;�Sܿ ����"�lT'�`g�UzX��ċ���D�g8�,��]�5�[��3�I@�'[�?w<�}D���@�3��iWH�Rԕң%s�F�Q��jG<0�u��ŉ;��w��W��I˒�C�.$�`J�_�qLq�M��(n�O��nL{�=]�֥��`�uet�@�i��s�V�;�f0
�z��n�>e�a?���N
�Ỷ�ٍ�&]�\�=	�J��Rx�9���koM��R���E��Pv�Af�	�q�������n�{?����������$�ƕ�9Wj�\H�)�/gF��ώ�8D�}&ff�Ji֖�[�ãg�$����?7��}�Z���pqc��v��)S9:�|-��{{�t��b�Abs�I����f��3f��/p�x�@L��qD���"���J8W�3����9����1��{�.^��v�S.�5T���R#���k��4�x��m��#L�)ad<��߿�]�;��U���+�g�����Mf�K{��_����p�X�hc[��\G�[$�(�.7�gN>��e=7�h�"��Z��;bpyʎ6߬S�h�Jb=$C�p?���
l��e,K�z1�?����K���Җ\�	�_T�hGLE.!���sM"���8�6��.���ZǾ��=n�Hqk����?�Lv�XsZ�����u���$������Y\h���	cִ��
�<�\W:X*���cx�sy�Z�;��� LO�1�������&����YD�03�����͒�I��i�`�s���p��9�;�lC�=m���t]<v�5\7�i^��H8*{�Y�G$l���Ո��Z\Tu߆,պ�y�N,�ɖ(1.�v����-���x��[�x�ܞ����(8�'klQ�g(R�����PfV�[��k��Iww���3l�cy;Q�Z0�'��/��=Er{�F���H�}�_��^5>3��n���K�j|mө�����^�2}��W�̇�uK��@�p2���$�I�\:?��_5>,`��[�u�9�	�ԍ����	�r�NX�I�m,j�&[��U��~b̽ag?KvO_7/�f?��~��!K����W:��H�B�S�_�:`Qv�t������6�Z}��#�5@8��bc%�C��#���mٚ�H���d2�%���##"Lc��*�wV1D�]���t�3���v������D��1��%`���6��	�?y�t$��uP����@BR��-���y�YQ�!�q�ڏnn��Z�q�L?�v������˃�W�ڗ-��w1T�p4�~?z���/Re�ƪ�we�QݻP�}�s/�u3S7mQ��k�mn�r�Q=�R���'�С�Ĳ%�VlB"@4~х�U�B�^)�箸���u82�0j���%�p�nԎ�_=��8K�v��z����"
�|������7����?��A���� �˓?��?��q���F^8ɭej0,�S���z�ݿ����b<|��Q���������j?��cKċ����qRQ[8{]��a(l��Cky�f`� C�,	K��-��g����5�q�;�]����Vn�)��w��3-���/���Z��Y>�����81��fћ�~�nA���i��S�M��!5�o�*��)p�ZÜƐ��M��<�w��Y@�e�o��muV���?���Pp�bE�n�z�r,�ؿh�"WW�ƦREç���������}��e�p��l�n�y�r8���!�/GE�'����#ڃF����K+yڴ_��]ҵ�����pڎz٠{�lDm�ϓ�!T\��|���Ϳ��!F���������Q	��z���b]o��z�v����cU˅�`%����;=$�u�e�0O�m��E���Sb�h�������KK5hZA~;߼����C�9��L��Y}��K��0�Z��sε���H���T�!.�i�h�?8N��\Y��]^!���]���?�h�������ˡ��vs~zZ��m$��?�O\8!b��?���t���x���S��+�T>��V�GCo�&r�=��VK^�v��c��̲\$�^��?�*�+���V�y�-@����x�@y��U-](�r[��8���f�[�cm{Q/ٸ��ז�l����P�į�sP %CM�h�@<2"��($�+��/R    ouI����6���k��N��s�T�����'�$q)J~��%�!�|T$H1@-o�� ��
Y�w��{��-����7+~��2�a��\{���0��14F���)O�as����|�{��O��@1��X��F������Lү]�<I�jұ2ѰD_<���V�.���o��6䀰m�����%$"CW��bce���ɨlA���呺�Dћ��9�,� ���+Z,��&�Q�TǭQ�P	��?*�ƩH6����8$<�"��a���ƛy�����)��y̝��\y. ��&�`�6�^�Ԏ�
p~@1[>Bt�E,�2�`�aZ����>l�2�l�{i�Χ 7�c�}S��N'Q>՗��^��ڌ� ��n/Q��.�5DQd ���I"檈2�jE�`}O{�����i���6�����{ԝ23�6h���'6D<F�#�~0X0��_dÊ�Z]�92o�)�f���̩�Ly���?��gN�Žg�S�)���~r��}S�:�Bwc�.D.�+��݊u���:R��Nv����o �'�=L�v�e{��L�}�@���=��?O%�H�A��_<d���� ��T��&��՛髫��<���yax��b.����0��teOk�|_������p�W�H�m�/R�!�,��reUJaK�`
β�_���׳՜����%uG����V��wg�S#/p�<P�i�/K��j�5�M�g*p��:͔z\��d�{,omf�aM2�-�0���8��޶ǝ����f @,(}��؜E",��_�l�ʩ5��V�Ķ�h�N�3r$4�$�Ý��+/u�N+��-yu��<��;/���/��#�f?�,8w� ]\сC�Y�k�zK3n�.�q�;�m�G����}U�Eǻ�a�t���	Gp�GTK`�wޜ���+4�4�3�8�.�Iw��s=����.����&b��rN'��6K�� x���,(�A��]͛��ҳ�t��U����-r�5�Y˳�<{��&҆l`�ڳ���'���s����Qp�*qx?�Hā"
�2�O���\u��iߡfl�h���s�����6���t8l�
~$�����o�DZT�QIȍ�;o���K<*p[�N&%��Rm�Yx��d��I�9�g�8�'.�6��WG������e���GT�cZ���W$�pW\�U+�������4nқ�n�6�+.m���1��ԙM�0W��1�pq��]j�#�\����3g�tS�s���j������؛��wfg	I�F����Iy{^����/p��ue��b�@x�%��g�n��۸N�8�~o{���<a+t�#g>b8/5�H�rgo<�,��\��Ӿ*̕�X\���[@s�6�@e�#�j�8�k�u9 ~|�fˍ~�e?���i�<;��;��r
wj������7,ȋ����3*�X�BkP���	�l�`�=�����z��O�y��HV��<�j��pť2��ޏXښ��Nyh>�Z���]k�K6�؎(���y����+�,�<�� ���:J ����!���t��k^��"��A�;
�����]����,�7;��x�ƛH�����I &0�����v� f������N3��#�dͩ���@�y��v��>6�J!��mk�gG�7��NZ�.���]{�L]0��@f�A~�� �}�]q����y�	�߰5\!�Hp+U2��Q�>��OZ|x1�y��rl���SQ���P�C������r��ǰ�sr�Y��X�:o�dMI��^&]e\Ø�˹%���{V���v�Oo�i�Ҷ�OϦg,Ϋȭ�/�Gב���b7,���C�����+��3*sWǨrn�L�z����_1�dy�ۭ^�P԰sg��v٫ W��	".s��lp"y�Ī�M�L�Zx�M{,Ê�a�1��Z� �t7�Nc�q� ,,���ׇ��v��WC}�ƜZ՚�<U���C�!� 
�&	�6e&Pϩ��c�r������.P�8�"��x����aŘ��O�|v�=�8TL��9����"�	����ǐ[!�[��8�Ҵ�jx��\o{��a[��$[�Gi9Z�^_�O�r�|�k�1��yY�w�m�5�e2bդ���݇��
���M?F��k�q�e��G��H��M*U�O�⣽�,'
��-T��98�L�)8�a��H����Ň��w����n�l�r�62{�=�ܩk{u��6Q�9\�Cؔ/Pp�{�z)87��N�Qٱ=�����k��v��X�'�v5���.ל�p�u�	��Ԡ`�~]�kJ
�zo��DO	����,.�n|}���q?�rxFy��!o��'�y�m�
�����^~�D� _���~
.�K��#.�Ƴ<��!��ó�q�ʽ1�{�>C��g�da�b��1�����n	o'���ԿSpx�^��W����BMe�ٕ�t����,xs�����=w���
<����Z¦��n��.���h�n�m�Zm���]�t{�G�NE���Bv02%ҽ�ləVMp�q��My�k�PP�Rr�\����U�Q�S_m�=��ws�2�Z�p�qa�Z�.g\��He��p ��5e(�X�PZ�B���ZB1{�}��	f���5dUJۏ,n�w�k����;J��ѕs4K @ ��])ڤ"���R����
�d���msh?�Ae|�۲u�[�*�l1�$l�5{}��S�;8H��?X�n1l0��X�DP!�g_W�����!+L�qh��5xW(�������Qo��%�z��wp�HZ�6cykt2����+��ȭQZ� ����#�V6x�q���#���B�F�c�:ݣ�ke�r�������e�_�I4�cu��}����Ą��(Y�T�����w��*��+������(���Ѽ'�ǵ5o'K=�>�Gxv���M��Y4Pp��vD<!4PX�%/�i��鹅˪E;F�*բ��c���v8y9s��n�0ێ�-��t��_������z�}d#��o��!�u�Msv�ZwiYÛ�ٰJû�f-ZB?��}}З�#�gjl��z<;9�-��nW�Z�|��i��rD��@��#�&��t4ё���]�SkU3��x����l�_��W��M���,��ǈos�N��sH������t�� }3Pt0���ITLq7�$�H�P��R8m9�`�����V&�q���9��p�^��j:��޿�os1�AB̖��kjT��.7�称�`�m��yh�q�������/�|xeD!�Z#���6\������`sE�L�x��:���֪Q|n^��M\'C���V��Z���\��x1oݜ���<z(��G��|şUƊ#P,����D
��O)�Pji�.t�҅��p�9^��Z�ڋx�[�>|(�U�G=q ԇM�� ��C�Q�~��R]���סQ�	1�M�y�C�����Nۉ�2�w�w=\D�q����=f��/# �i9"�6ϲP��ژi����G�ۆ�6y�q|�ZI`�t���H�)�]m9��.3i8�����ϕ���	8 ?w���,�of)��7�"��*���G,�>���j�/����$���#���;����&zO+|X��]G�����<4�;��;�	�T�s�|Ѷ}��G�[<�%~��<���5By&���ɐ�a�x����-H��>D���W��!��t"���2E=����h�,�3�n��u{h�EN���y�j�Wm-/�xw�>��ᥤ���G��|�q�/h��*C6իY�=F߷zU������:XY�6'��[{�\B%ݴ�T�aa� �������ؿ���n�vU7[�~g��T<x}ҵ��Q!��M��z�,�w�t��#?mM��N��_V�N8Zx� �ݴ˾�m��6�~i�(���{|�	���j{���'���s{��(��x2��ݦ�]!�����b�C%}	�č    �o��RТ��*��Ҕ�H�igͺ�֧ s�{_,{��J6�.�S,��OpZ�  ��b���'�AO�Ly���v+�+t	���t2^ʮ��Ϫp�.���?u�d�O/���-�5�o`l�4ʉ�ޏ
C�c�������+V��k���g(\);vs�/���:��p������H��x�����Q�X!�E�e��#?�z(E��7Ы���K��'W��5�c�����e���e�w�{?���t%�O�n�h��J,dm�w7�d  �<�85B ������Z��>=th�rZ�A�x�eo��MԔ�5�=��D	���~	2@�nn~?��5X�������,)Q�z-!��;�x�yY��y|a������hfa+r��Y>PJ�ҷ�(.�U�%�����]s����$=ŝ���(n��}�����m!b5r������� \��57D��^7;���M��}Ȃ�e���#j�Y�v+rM��f�Qܨ�P���pM�	���pHy#x[v�޻d���b=}�����M����w��_�bXbÉ�
6�pOK������7_F�'�6�양�|,_�綽��]_X2�u��x�۟�[ᣴ����ѵ�;8���y"���!��j��O�V>z.����������C_���,o�Syn��<��!�Ȱ_�L�)F��؀%�A��,�tS�
�֦	pڮ�d=��Wt��Ͻe[��8�t��vk��ѫ������x��z��bHQ������Z3�7����%��^O�\7�d����lr��M.GbԎ��G�i� .�~T|Ԙ�FQ����qyĀ�V�FJ��Z-]Gq��O��˰c�Omg����gÂ���s�V��^�w1b ��%z?*yH>ncs�����eE������#*ǲ~�1a��im�n��+8���==�n���!:�例0�2�O�\;b9DM�/8�U1Y��5��|ﶤ�Џ�a*�K��Y"in�����K�-�O���&G����3/�bJ�!�H���"�˹o���v�%��6o�/��p��h�I���|F��Թ�q���
��!�AE�����E�E�Jj��_�3�YIΦz-rO���Y��l9����*�ɭ��y.{�3d=��iz��b� ��UG܇�@��X|��m�6��Q2>��h�8��N�CY����d.�'rv�����bﰬ�U^������������	)�A���_��B���G�)ًӼ�Z�����Ye��M~�fʳ����֭��AEnC߿hP�kcӋn�T�n�����Tiʪ����
��=�`�Ԁ�N[=��?i?=�~Ւ�����NV���ՙ��I|�̒X�� ��^����)�ܨ�فj��&�n��:��L��
�mz��.C{ܙ��3� �?�'��IE�tDu�1m2�h֛����������ѥ7�W+��d������ˮhk���zJ����n�)j��,����u��\;'pBa�~��eU�wL����,�Mഋ��.�[��<�]�MZFry��[oٻ�?��h�@���{��c�D�u��|'3��;���6?�Uq������n���wV�>\Tq�wE�ŧLb˿`c=u��u�	�\�ҙ.S������Ǳ�Ff<K�)��.�u8[�H��t&����G��~�LCL���Bl�pn���_T����R���o�4��>8�9���z;�«��d�Ӱ���H��~��Q��{`0˳�F�V)�Z����U�+�k5���݋�����fDw�ˌb�5�]��5��l!����9*J�TB�7#����գ����)nP��'��Z�}m��#5XJ�tb]���%&��y�x+m��{�]��n���<fY�vDu[�!HEG�S�lES���j�+�6[l�m¯Z���7��o�س['ب�����8���i\L�qX��M3´��#Q�_t�9nX���*9�ruZ���ҷ�8�����T����K����Ȭ��s��wN�Q1���#X4f��1j��O\T�h�\�6�g�u�����·3�z�25�м��I���%O6�Y?��G,"������DՈ��E��E�wU�k	�屷��9]�ەp;��$Yy�vR٣r��d)I�I]7H~���)}��S�~�%��������mC�SV�ָ��?)G��ɟ��=����+���^?��Ls��lZ��	o)j7<��+�7����<K��/�Řr�='ܤ�=����9ky��>X�C9��=}`��Gs[ڃUf�"
ٴn9�O���%|˘�P �7�^���A�[U����<��V��@�ߚ�h=��O���
'�s�g60L�3��|ݘ�BL�{�,\��k��r^Ġ[`j�jx{n�ֵm��؟(�%��jW����Y�b�����[�x]�2�k�	[�B\���j��Oq�hژ*U�tYR�S��<����nF��m���\;�L����=�-;���_��$��8B����ڍU��U�:���XW1����;k��CV��R80�ʺY��<jϬ1v�̟�N��4� $r�#�~��>�ͻ�hS`�w���W���k���4;n=c�jk�?�o"s��I�s��cV�|B�`j�*���b�z4��w��<��&�b�����=`? bX�s�X[���W~B�V~��L����u�Z?z���.��ŭ�t��>y�$�[�P��Ǉ�����]�4y�a��?x�ai�)6'��>1�U���Y'�ʗ���0$*2��%S��t`������O,�,��Wq�{l���!�7J0�3� 6�r,�Q %[�R��o��M��i�Z�ǽ'J��r�p��Z��`�sf|f�</�K��րc:x�Ϲ��0�#PdE��l�"º�TP�0���P�Uc�]/�V��a�{�M�WӾ������r��ߒ!�B���s_�눥b~�h�_�iZ�����~�d�y���d��,>�q2u��o��D���z;#���s�M����u�B����N��~���a +�nDP�r�>AK��:A����%�I�w�{��6�Y�S�yz��������ε@
@�j���f���ai����WL��9%�{l�����S��c�%�j�w�{�6럻�b%:=QG����/V+�k�4[(��,�EԬ8��v�"����n�#�u�L<�Ԩ��H�+�e+=<�@�i�&7�AW�n\rxf�hh<ԛ5����{д�����V���FL�]���4J]\@b����˙���)k�/Q��`s:�s���;^��v���U��T�ȉ�#��G��t�D�饱
ZI�F�]x� ���#������L7����?O���6j���r	�t���:�׍6���2�����rU�}�F����hsW��Qyؾ�I
w�[]�8�?����.�gy�{AkJ#4�MJ6�jxT$�>y����y�7����v��.9���JOb.Bo�������Aܿ��Fx��X�KO�Hǳ�����pӎk
��V)�bn�`ל��z=���c�=��d����f�{q�,�Ǣ�v+���6���,���a���L����EьeS��4J�?̨`׷]-[;�\ӧ��tP+�ۄ���t>^_�1�&�v���������������qoG�bS���@Az��!�
!��z�3k�#���̌�qw�jH�1?C����x7�G��n���=+<�q��A�i�� #7VRn3T)��̐�-e���9Gg�ԓS�%'�9���}zY��-u�L���i���Q����/CԴ'�R�����}5��nNV�|X����թ�^�I�Ͳ��vn���E���5),+E��+��Ep"	wXYr�M��0m[(���1ʥZeov���p��b�Xk�?��:rS�y.:;֣�{��~^��h�f�s�,������e#���fts~�Yy�0�T�.���`񐃅��N�[���=._�#�x\O�jo�]�����.s8���MB
t��Hhq;���)芅��۩%�w>    N�Q��N4��Y;���iO��G���x�X�y���.��}V�A#��"3f��i,MNA3�sz�z��y�w����ՙ��n�-��	H{-4��=��;~�Lo��i�.<"m,��C/���`�A���ts�x���E��U��U�b�]nN��ޣ=��
�N�d���}`��A\]��&�M�iF�x����e��E�R�A��
�s+e�)�βɣ�o�s�\��#�a����].����,C��
d��c,~n�.N^�h�ҷݴ#�"�$���VTz��*V��ɸ�vK[<^���]��s�Svs�K��|�t�!��Pg,r�����i��m7����\ ���U���K�3W7��2�2�N�~n���(]�g�ߍ�,�4�|���i&�C�3�VB��CQ �����d�W�������&v#不ݷ}5�e��̈͟s�<��h��M�p�����0�b$�*�"�j#1M�K+�n�1�Ի-��y��������x��.7Ai'��Η����p���.Ⴏ� ^Ty��Ë"��|���≓���J��I�\BFi����V����[/O�d�������b���t���õ�<o�LS�3���_�k���F"~?h9�x$A$6�mN6s�YV�#����^���l��@Z�F��7�qjͽ���Q�z�ᶗ\Z+E�Br��GoG����B��.5�i%/7hP�����M��te�V���,��]/��X?�3'���d{�h��E6)�bw]���#Th8a,
t�d\�0���֫|Syn)Y�Y?�n�S�2e���\�_���|7�Ff��&���	9��_sʯ#:y�	4���f*(]IA�o�ў�E���v;������c�g,��]M����ǋi����L�y}� �mCL��1'P����A��
��UI�@��.�IܴUM��h�ϳ�t�ld�Q�q1G}}ty�
+�bC �,������2���!7��^Zn�	���Zm8}>�G᪻t��
m�~9>��)�������f��)5A�B[��W��F�hy)B"�r���W_[^���g�VO�ɊѴ���d��CGj����v��Ҭ�������扮�b�����*�hY�TGx}�F{U��Rgy��u�3���GK�az�}vU��
��PyH�~$�:N�H�1d~���k2�~V�5m�h��M�2��
����쑌Sl=���MRw��z��hE!N��|��%G�C4���0	��;]K6���'rd���;��seo&����X����i� ߏ��c�i�ԇ�M��	������Gq�'+ƈ](�v�κ}g�M��}W�њ���z2�zϻhʠC�m�xa&���&l���?�h��
J.Z��������.�����m��en�Gr&-�9/XM�	�Y�����w+�WB�Tګ�=G�Y�:��y�4���/�ŗez^G�N�H���H�B���U\�M��m5{;�i6H`�h,�OA��Y
ڮ��-ݨ?���z��z���s�̅�t�Lݶ���ù���I׭G�X�uD�A,2�(�b��"�F��H��6M
ڭڦY2���8�zX�K�Uc���6���M�ؕ�'�f��Q�C��7��"�q 	�_0i�7R̻��e̮5��]3�y��u"�P�%׏�A���7�o�uL]�'��U��
��)��e������E`����{~�>u�E�S��Gq_Y:z:�-��x�(��?�ꊏ�Zi�澌`GTB����bs�!C�Pp7����8����.�4_2�q����Z;N���e=>,w�1��_�+]#&��Ӆb����ahz��u��k&����I��ЗuW�a�$mGFN2js�����K�Vs�pc`zX�Z>����� S�E�$��e�/x�9<;5J#�
�x���f�TY��~�0�t��П�G'�w��E��G�><P�+��K%�Osx�܃O�y�2��3��+m)$څW���Q�,l�z���0Zr�3T8h��U��?��vq�";�T}�v���֗Hia:��K��`b���f.�������E>�v�e7j�>ξ�ڜ+�U�]&#��F<�5L���.+�D�	.=�*)�����Ɍ���\9����3�h�M���h����v��9��Oia����bv�c��?Q�	X(K�q�ң�>ҥl��h"5��*�/-�c���Z�eKs���f��L������� 7��Zu@����]c��:k^G�Ƴ4��
ݰ�GA�0�}�6M�n^�G�/�ܸ�ǚ`���t���:�Z7}w���~�ܾ��bj�����q�$`E�G��jmsK@7,���Rڼ ��J�+Q����9Kk�o![��@�����:��s=5k	�ܭ�h)b `qh��1&�a�aB����z������Y�#'�ToŦu��k�Zg��Y���V:�Q��7�*���X^D��]d�s������_ߴ�^�}Ӡ���l8��X��i�z>ՙ���Pg;��v?9���o�v�o���c��[t2 �؄�}�P���i�4GRܴ^�8������2��������eȑe4�Tkp���|`����Duo��M� pxM�� b�	��fh��B[��k�К����C�Ǡ�>o�n�����kcq7%�I�&�5d�:�~��޿iX��� �Xo�p����mR�U#��;����\�uy���X�|'W��f��H<���e&'uA�m��Ha4�JB[<��f���
�_���7����'p��VZ��亷��F������L�_��P=ֵް��d����-M,y�""ݰ� �Jk�
�^�Z��m��m>��c�j���ig���}.���h��*�^�o�Ji������xc����A�v��0R`�U)��^wۙ)�������n �;����:����n9�^]�� +�T�������x�ڱ�s4�O�4������{g��v�yd΃=������6�u�=���RПI��y]���)T��S���$0AP���Ϥ�M����I��\�ó�����W3�uS�y�� g3YK+����T7�7]�h�}7ި��İ�y7)@�%���y��d�Y��P�m柼a����=A���l�=��{Yr4�m����11�n��h�����&��_�А� *nZuX��`귮�(\����@|r�,o#|�}�������,���%���YR����O��4�P�� �J�>�^բ��͈����N{�tRoݳzK=k�l�<ﻉE<��M(2�C +��X�/8H�J5��J���]���I"ㅴ�/���p�$�H��̹˲y�[������'����zx�� ��ȑ 
��n�mV��%]���BW�r�{�[���=����%���k)���`�9��}ӪL�B�e���^���TC�|�l��ئR�b�J�jaoB�q~W����/v2�?h��w3�g���Ts��n���h���o rP�X�y&�0���_���A�󱕇�9�q�3�0���8�Ô��8頑~Zz[�)���H��5}�5�Ru	IT�Ҥ` a�j�~7G�*�Kg��d~��;R�&>o��{c����ֳ��ފE�6Xb�> M_Tff�DB�{&����==�uF*�ڬ�5���w�1��B3����?A榈��d�@/�\6���IQ���>d�N~�Y�R�\q��P��F<��?�i�p��
�Ҳ4�+p�_�6����]���[�]]�c�1���>�ig����j�z�����6�q����eQZؓ�ME�kAd��00Qt��;֑G[σ�����w����6�5k�Hh:���3¦����-A����FOqcrc�;��j���G�>y��J�����e��-���7�o�A�
P5�Z�~�+�������:D�]g�h��e/Lt�`~����c�Ԕ9ܙ��(�����+��,p5,��p��*O���    ~^�v<r�k����GM��;-4C'[(�=�9�Gmc�s}\"M�1���j�,�1J9
���F't���n���N�s�.^�<�$���t:뇦��p���X�ߝ͝=�<�}� �P� ��ġ
`���P\j���&�>�/���q<����i�d�����KE�����o(|�<��#TT?h�<GB���#�w�4"N!��#�0�3�(��xrl�;4�x�lk�i�FrX���D�������\���Qӟ��h�
����������%b<ʭX��ٹ?��v�����1^��h �o��b�	�Ы��7�A+����}�jIU���{@C�d�v<��yorP�n���Nf��yΙ�@��L$a�KBE �Olmڇ���I���yN�O�Q����KG:YѲ��2����LbF��d��SƳ�|�WﲹՆ���t(	���s\s�e=���#�Tߺ���p��~�6��Ŕ�ۡ7�k�ڛ�m��\!]�,ԍj��+c:�/2������0Oi4q����Ƈ�~��0��㙙1�-�.�CdQLOn�[[�~�u������*���m�ϋ�,���Ba��m���(��D�t���'�n[��B.���n0�@\[{�{�,��k��RW�=���o���	 <�������!�*�Z�9��ZY�y%�f}o^G��||������=m�6�NhG1�F������t���N$��
�����9����}�y�$x�C�=x�2/��Y���9��{~8j]�?��3j�wS�0s3���E()���O�/P<1fy��H�И��5�=�)�{>�<f�+�k��v�$LO"�����,�E�u�f���PM�T@CE�
jý��5
�ʐ��@�+C�����B�C7�4�s���,cg|����Ap�1E]D�S��+�/؅�g���'Bs�:�q��!_�򽽹͓������x<>V~��彡��˽m��'���8<������Q��p_.�6��E��i��
M��Z6�[Yɍ�5�`����:�,��}>���Y��*�$������q�������>*S��8���8��-�+�);�>�g7�gɞ��t�A��`��Su�ߤ��&�鉋��Ή�k��*��1�iO���(�0��	�9,����f���>�W�ѿ��ďB�.g63��yZ�3%�����9k�������j�7���|#N`�����SƔ�bc������˖
�5ZmV�$���ssp��Gw�ף���G�o�14��@Q]'�� �'?#6l���tPZ~IA�[Î:H����6~`vMgc��������5�������Z׫�\+�L��e���-��]�	�v&�����7��d�|~5ͧ��i%�nh���9/�4�IѾ?�Siú�_�h� ��"��,� �����#���*�]�ܥ,���%�z�L�v\K�K��Zwk����8�y��1�����a�WC9�鍯ͣ�(C�gu�a���jɏ��f� ��-=ȃ���Ρ��3n�K����£��^�c�����w�N��Į��V���unN�9�Oq{��K눪���R������P����?��n�ΰ�Z(B�������/R�����B�����-B��jwz����#[\L��l
��K���y��9XB��|����jws@q��8��}�|�e���l�F�YZ@G�i�$����������`1�$��/j#6�m�V�z��~�z���?H�C�S����TTX�7{�$D��>��˪�����bB���h�%�0��Ct�w)����Vw�~�$��+��[]�/��]t��f,����J:�.t���E$��$-?1�'b�5��3HaHB�
��� ���G�5���|�O+c|S��Xe��������4A�	BX�BC�1�ťI�b## �c�9	��u�ڛTh��u����l���5�n���sbss��������4��f�'�yz��xtr����l\<%�7��R�^;�S<u����V��ZY
�$���c�^��y<M�W�q���y�'ӧhO� ��Ӝ:=���#|@r�$�Ls���@_+@/6��jm篰�Utb��t:7���/0yN��>K�c,����r��ۓ2������j�ω_��B"���pxBj1Ӝ>�!2�iD�jP�ƅr1��Ō`M���~,|o��<R!���P���Qׅ]`+�Y�}��Mu�YR�0���� S�醌w�X�w���]�l�S����.?�.G�����u"N<��-���H�h�����K������[��|���67'��24�k��[h�0�X����t������Kf���!ъ������<�%h�<�)s1 �e������ᦺ��*w�^a�I���-�'���A�l��t�0��s|�rؚ�<��cs�OX�C,:��x��ngs��{;´���4��Tֺ�K�]����}۴s���s[�o�ĥ�h=���8���!�M��1��==����RD<�������Y�����DJ�J��\�pd3��i�9[X��@صoAdO��ޒۭ�mAG�Y?�y����gY�=�����x��o����*'5F�V������ֳ��5u���D��ǒ��Ρ��&z�8���6�0Ht[� ���a�R&����qv̔Ʌ�2���C�sk�,�_��i���n۷l+��'��v9��󸦡z���L�n ~;���Q�H�#h��')-IR�Ӫ����kx<�nov�lt��bf,U^e�����R<l�M"О��x���@@!(roG��#1�U��~Ȝ���她�]�z4ې齳�߸��:��cȵ��t5�9��A:���:nm�]	���+I�A��_FH"(���]�mb�eحT����mq7u;�E[�Ƽ�d��wC�'.�LE��}��
�S8P� b��\��iُ`��F�a���;��~��q��E�A!�Jk���l�m9f4�c�����m��)�A��Q�|�/dM�,��k���ۢ����Z��E����>�a�ǫs>�Ng�������:���Q�^X�7\������7�Rپ����0DCs�T�A�T�q(*
�"(���Uc���#�1�\�MV�=sE�X�$A塀?�	��5�I�l\'�3��o)�X"W�
�"�-Omo΄}���8չ!��������5�0닋]�R���'P|����g�O���ZD��z-���o|��U\|��c���^(���Dt�{d*�|OS�(RN|���lҟ�*݄_��I��k8!�����YQz���)D��e�����waj_�'4@u1|Z4}�Kdթ���S�$+:��(�<.��?��t5����UhO'igy��z�2�:�	�К>�Z�E����E�hϪ��9o��=�8���F�4[�>{p-���K�G� ���g��>�%�
���*�?���@�t&�����Qv���Z�CYs�����!(3�۴�N��1��ވ���5
�)�INq�� 垱;�[<���稦d�����$2?}dY��X��CN�3�A(�0HDĖ��s�M���RӢ���H�l�P���e���O|�oܨp�4'v��(c�g�?ގ�?�MY�!�y>�v�(&T�r���wR����T�8WF�*�_��|�z��n�����EV+�3s��j��@9�"�~��`�7�G'v��?��Y��5Vw�b��!�����qX�3�d.�{J
wK{�2�=����q�����d��iӇ�˫ee������|�!�R�H��}O%W��x�m:�q߷�0kK����Wם�#|$f#�=���@�2T����������������iz���|>������L['L�n����w�x�0�H��:��i��F����@_���ts�������=�[yf?�t�SQj_n����,��*�ǁ��`����V��+�1��1���Ú��m�*fJ±}��D5*���̚W6V����?�c>��"X�	�|$    ���k�Q�>K֫��&��K��EzZ�9sԜ�ku7�l�? ��`8�������@u��������n��)?�ƳAxX֨�},���QK��l�N�#�><�Rx,�|�;`��k�u���-�M��w�B��:��XHМ����qu��l���K�=���]���K>N��"�"H�t�-O���1���E^qkK7�m��nl.b��wn��؏+W�!��_��K>���RrN�o��_��jn�L�T2�O�ޣ���ZXw��Z#ײ��T����&��y>��*������W|��t�K|V�+v�^��f{i��P-.��F�tXߓ� �EM�{�`��F��������SЙL�|1����n�Hb���t/�����d�n]�S�!F�J���W��}b�!Z���/ʎ_��J���_e��3���x� ތwhLO6�t�k�:KM���i<͂�Q����"������%�q�cv'�jmZ�i�0,)�h;�&��������?����R�,�������\R�8
�/"�1zS�%��7�ܪA;���R8�y�.��Vذw�E��k�RT�,����A�?��Ǿd�9r���ܿ�xƸ:)Hq{o&�0txOt��L�ĊW���sY�Ca�7Ϊ�JN`ѝ�=��Dٿ��&�s-���)4�e��4��m��K�0I�����'��=QD������g�����2SY�Xw���ޣ�A�0��rt'���Db�_8c�=ʖ�}g"M�)�\���=FNW�ck��~"�N��6���s]��}_�oRP�%D���w��Lґ^����ڍ���{S�o�&7���h�T�ht:Û��m�?3vm`�<;:�xm�n�,�}�3�<�����O��20�5/��iu��f�Z��-����^����>LR�><��k����{�<Nz̏pc⑈���6> G���5I��¢S�~�<����>�ݸ�i��lq��q�$0M1N����S>_�.�d<1Q[2_�e�� Ucg K 7�O.��/���Rr�:����%��ph����B�l��WwE'��13y?x�(8Zd�f5�In���]�V���t� G�~D�� ����`r�&�`�� Uׇ��С��.���$o�T�����F䓀	�_T��JIXJԿ�$�s�}=M��Z��g�1�I�Pƻ�Β1��p�ʤ5��������r��E1�<����RF�K��RƗ(Jչ]��j�:����a���e��N��l���%^m���IB��^)H�\("�٧ÿ�����M����n��W<��Iq�L�������,,k9X2�y;���%�0�T�,�>8~a8�]kU��oZ�Uívj��t��f�P�+|�l�f�����W�&�ы~b8��ҡH"�σ�Wc3oc"������y�s#\X{1E��γ�f{�К?` k�5_�ۋ�-5�k�C���+`?�=�%07��YR�E�V��Ղ�܌��54��;�JK
�ͮ�V/؁�,�.���}`�Z�}'�)��|0�g��k<�B�U���_���ߟ�����v:��]�m	���R=��v�����>���j��R;	$�C�	��/�y�~Mh��ƽk���Z��n��.Y����qk�,՝o����L�@���h���`����秧BČ@rm��j��M�w�ӷ��܏:V/�m��[��G�h�rz��� �8�.h�?L^I@�^?�e8�c�п��H���S��Ը��7h�7���[�G3gm]�]�;��&f�k��+��h�ؼ��S��O�����nT�)����� g`6U�(f<2�->���Q�wªd�h�n�ב��zH�9FE�����ܼ'9XcSZ�T��]�t�ֹ�hx��kn�u�p��X���ڛu.w�݊-u�k��ѣv\h��m-}���/�J�[�&[���(n^ڵ;�'E@/${l�����٭3��Iw��	�Rj�ɁR���k,@�"GTjT��d��/����R	�����ޅ�i����6�U��)��B��^[�s�e	㴛��|Q;�+�R�uЫ�B�� ��K�
<���MW���ZZFz��z����+�����:;��G�B��6��?�����0��F�N���n�l���o�E����uyt�v�"wY|����Z���g�m�悎�=;��˨�W��6�Si�W�Un�1����i��k��F̭�7M6��ܨ{?���a;��(���_�b3��B�mgl�_�lj���{]�%6���dg/�(�yx9��Z7]�!�r��ތ�i�/��iݢ��������-23����5p����2�2��6�F#H�g�ߘ���RqUJ��Y����1��5�N��uv}g�IG�{f{�0���5AΏ��Fq͵<TΡ���D7��Q״J�Vq�%��j�Xr��'#I�f��cū�����'l��.F<h���.�CC��;��'�1q	���QB�~��ޙ�d{8�Ŧc���s5v3�nqA�hj\��u?m��j�0!|�,������
�*��8��w�nݵ�����yr�gI&��|~!њ-\��y��K�%B�%D���X7�H�?��P9���w@?S6�)]F��d�t_��������ts�Ez����֯��֙Pϫ�L��G ���>AQ��?��'P��3q �g�1%%%��d8.�o����Ў���O&���8뚖j���([k��Ӷ|��<��j����y~�DK��� �E�H�6m$�B�X���k��Z�����v��zٜ]�[���N�ެB80���>�Uÿ�X�JIU>D�����5�c'H��kj:�7TS�?,:|(�p����U����؝�u
΅$�#(�S��§��Mv�"��%*i����(���������r��|)SU���}p�.�����ۭ�����f;�æg���F=s�<o�Z�������G�?�\�$	:%�&x�V�^/��4��	������7�>kS�+&p�Z���n�l����[w'\�N��E�$B��}ѧ�3G�,��o��]��U`vL[�of�\9i���%A^��c#���J�v���t-Dxdo�Z����3jL�MslP�W��c����ˡ��p�O��e��&��h��#i]����s�CU{/|�+9 �T@�w
���9�ј��\�q�&�#���}����]���7�vϣ�dU<����l��#%��7������J�LJ��W��6&5�;�l��wL�R���U�Ng+�� i�_Rϧ�Y�
e$쒑Ǝ|����HY$��!� aKA��4˄�� ?-&4�3��.oF�����߻����g����Y��l=NΒ�6zrg�V�!0�#�f^��
�?*RTR� �E����� �U�(� �y��S��#l�V�����E=�c�����U��B6�E�#�o�p���r��O�дƔJi�n�N�Ĳ:�Q��~��53��AN30�]~g�5�Q�Ԍ���"3Jk5��xK^<�t��D����K$yudZ�������[���d0�u<�溊:��\sW���N�A�u:+���%4�7�}0��ϔ_h�RhYU	�Bk�U�{5^~�G���'�<���mw?���m)��{�PvOg��̪�ޞ�'<�0�5�/�(�:"9D��n��t��ՓR��'���Pݫ�o��se�^�JG�&��>b��ϞOcT/��`|����:�EB�JoZ���o�����q������yC8�&� @��gI1��=عyQ�cU��M��ixFn F$���s��1A1��U�(��R�'�ڻ��2�o�uW��1�SV�w���0�g����gm��[�*�Qm�6���a_>�W��R��,6}�)^\�)^��0[;�r᝝��3��ǏCv���A@��g��)��Z/���YȰ���nE�VB�����[m��o�D�]�G�\�x�v���|��L����<;�K��Y�|�XMY���"��9�x�վ��Ȅ���M+0��r��}(�[�!sT����{�����W�q�,<���;��X-����6�Ϟ���    �3*��F�Дe����*e�q�i$W�6�Evnm%S����[���k1Q<�^Z�9�Y7����ҹ����.8��(Y�vn�5�
�^��q��X­r�n��p�ͅř������CrNqC��Ϫ���a��ڴ�����OS�E� �_�Ê��F^�����*��t2�v[,�����V,%��^�{��l�?��
��]��-�=.�F�#�y@X�o���E���n�ƟB#eR��bώd}����c���=i=�.:'�᜗�.��L��A�'�|�,���3�yUl:]D ;Y�O �7��j#_�~˖0�~�n	�x�����f�/k��$S���u5ʞ�0������<v*()Z%ʧ�������o���Ԕ��#�E��]Y��=�Nd��f�A?����`��p�OH�-�|��Q�y�ňB�����Qg�a,8u ���t�gNͩ6�^>;��YwD�g��ߔ�0�ܓZ��Y͍Z�	�	B����"0-��>�������m;J�s�����{�+�X�4�������������~��Fh؛a}��*) +Za{�\��%�2.�W���O�*�� H��ִ�PB�VLJho*&ZM���*��n��m5��u�y���va�{ J�3X7�O�F��D ��/�S܂D"A�~qqUn�"����Wnb�XpvV�<�w�mK�7�+Ǭ�-����098Qr��{����!�/_0,/� x�L�p��́Nk������e�@�o�,f��n���{�qz���f��o�M�p�ӟ�b\�V�\���f�"�D�%�iQ��J�����L�Z���F��ȉ�h��)�.r$E�i(�M~�9/�!�;>�tL$@b>8X��\(�t�ZGL�t���:�jdQS��Ȫ��Q"����Up<��e��eb�S+�����<��!'��������Җ�)�S�LI����K�5P/8�󞿍Qj�����L��S,,%���c�uV�bf��1*�Ѧ G����yzW�oD�m�Z�w�x59�Y"+e�����j/9�4TN�`Ʒ�zф^�G��]:����k`,�ڋ"�-�,d	��a��υ������(/�.��ܻ6�t�V_�a1�9&�I�7=��\��I��
�A��:��O�Q&��%�'dT�i�\s��F�I��EcZyd���Y�.�[C��b�����R�y�c,��@��[�;�����Z��V^�WcÒ���x����ئ��������k��xwߴ�%���YO���\��y;��t��d��m��0&u7������k_�UT4��r�eX��M[t��!U�S=�:&g�c:f�K/����?�=.���y��ѳc2�����^WT���z�E��W�T�a I��i��"g�x6�|\˳M��Wƺ�S�R��A;��MU+uɸ����?9�Y���n�>�=�/,B�kv(���I�D�C�m\�������
���{y6�Εˊ�oՁm纷狍��\yq��K�
�֨ږ�+���$�_l�&�����׼q�J+I�+�
S��׸��մ{�$��#Q|W>����o��f����t<X���gE���qEJ�b�}@
�lirl�X��m񛈄�ԊH�Y!����C��=�[��������;Km�^��jG$�J�tl��}"l�X���UW�j���U�9�,�b�.�#g����V;�����^z�~\��2t�(� ��X �TN�cVd�|��eH$�ȍ��r<���xz-'�7>s�x���p�b�Ρ������g�(�f����j8��X�����K��D+����L���^Ze��ى|�
ω��t�s�����p�6��
��+��$Z��(��<O��������%��E(|^Ԧ���:�nZؙf��6-�(��B_��� ����(�3����m���GS�6�+0ȕ�����90���T�
<����Z��N*=_��v�:c3�m;�kW�ᛷ�N��)���� �k�6H�&���o�Sx�f�y���6 ���r��2�5F��jY� ��6wؕ���M�n���)N]��d��j�m�*�xv>�;u����e�Cqt|���L���[l�V�Q����*��߆;A��]#�:2g��<by�=,�\�t]!��']�r��`�c��'T�jAN ��7ݨ"~[�Վyt�O���.�0O�ǻi���q�Vg��q�+��`�^q���ͩ�O�r�y]�D_?���$�Mb9��R�n-5C1k��/_��(Um�M-���]��RR���Qgp-l��Rk#��V9!�xA���D��c̋E�4�,m^�"(m^K<�lw'���ӫ�^�@v�Q���j�>�Z��"��E�I�d���bh�[���"�_��'p�N��C�@h��
sW�4�>�%�<�*:�Ӷ�Ǔo�K�o�z�\U�'}S[���Ս������w��,=��1�H/y�Ǽp���]L��ͥ7����k�m��P�aĦ��N�h&�����lľ�����NЕ�)_X�/�_	�����O�W
F��k�V�ȚqWAQ6�5�6K�m��n�6L�;��H��*���c?X����c�
��0��yS���<�2��k�N�����ݶ���p��[k�-�x����.(�Cp�X�ؕ%�5D��=4G��$�a9��а�K^Y��g3cJ�[���d��!��_eg8-)��FY���@ЇК��v/ɸ6�':�f����|����HZGC��U�P�S�{l�>.̶ػ\����1����aT����D��kpv�������" �+r���!dy@�0��9Ӥ^ZҴ���!�7=�����U�N�$��z=�@K�P��=�K�tz�]�1ȃ���'<Dvb��}N#���o��)B�o;_Uj��y�+�%��ˠ���;+Y��?��>猇���Ci������'\*���!!��g$��F.���wrIU�g��Z�M�!\JG0���Mg�8�l�V����:<�ڡ~t���ɲ�?�>���q9"�y㸜jr�_�H��L��T��(s������2�M��1�l�J�͜���	䂶X��.�J�4y�8PN�7F`���j�kR�y_^�k�b>�U�X쇓��o��h�ɠ�^��]�%[���CX����iW�j�1�+r��>8	��q�B�k�2Z�։Vnn��fY}4V��J���2�F��K�~v���]��/��O���,������@�Ao?�}uD���l�c=?."c;)��ˤ17>�Q��yx�r���L�iW�
�y	�@�ף4.ю&l�k�����"G��&�VF��x�g{�y��P��0K���ށ_�������=:a_�#����`L�l�8>-I�+�q6S.Ը���k��$M����6Ե�D[�蘻�P^(�i�e~ �SrX���!�c�H;O�"�ǧ�d�*0�o�����žǍ�a���ˍ�Hޭ���s;}{�#.H�H��{��SU��Q/�N0&	��IoL�Kp;�J;J-�7��oR��Nui�ē��z���xd5G��m��<$(B/?�]��>h�{��@�8��'�ѩ�Ui;m�db�h;S�&Y�����+g����Z�d��{ƫ]g?j���	I��N��/s��c��LLW�y�8u�8t#��T��A�Q�TYf�������/w]�{B�Vk-��+v��p�����!b> _���PY7�$E��JU����q�5�o3�	Û��D�:��_��ڹ�}_\n;K;)��~󣴞şvŴ�Fbq���_�,��������T	pk�Fq�M}-�֭�*�-��Ӯ���s�#GB���j�U���'�U�i���LIP����0��S`�:��1+^a)��u,��L��'�(��/�� 
��_�3��ٛˮ�/k:���3�!�r��'�z���gG�z�����}V�R�� �ہ@�/��c\w{m�wsN���m�<^></�kF� �f�g���~�]Y������#7��f
�"7�&X���m��Â-��87.!zL�"    ن�dѹo&��f1�5����*�$L`�+�R��Ÿ|�p���R	�J-���=P�q��,�%v��_:ۺK���m�b�G���8�>��OL�K}��$�򥬽�}D�"��q��RaU��w�&E�xg��W�A�8/y]��.�yd����6�<�K�
?�85�@W �^�se�.`��֘�J^ʖ�y5���v|,�$��������s��rwJ1�f�t0�� �bԷ�Ӯ�<�$?�^>=9BX,���Ԙr�"G�-J�ܭ�Ey�ҭe��y`�Q�c1L���%����vx��5.��Y�vE�@��׳K�Y^dHxC�7Z-���Rp���*�������#�����/�ᶈ���}t�Z���)̲��^����i�~��d�2"a+n�Y:��oQtN�I��
��G6~ ��g�b�g>�Ww�N�gq�^9}Q����]1�cA����-	$�N��/�7�������ٗĿ�#>w�A�3�X�.ڼhZ�|�Ȼ�u���fs�_t��K����|�0  �{�E�f�+8�%�X��ڞ��v��w�q(H�cfY�ֶ��Е�.<���է�����`ܗO%c-?��c� oÔ��j[�cP�-,+�I�����rg/b��>�$�	������@��,k�5�������*×O���0P���P���� U��	p�}����f�����Ye���K݄W/L�����x�3?�u�k�� 've�r���r���s<q�\� ����8vL��Z�=��j�]i.'�9����e������t���y,�e��q�����IY�V�Gp�����n'E�n����u�F�<>��v�,�]��.��4X��&3s��x=�e��䪟 �H��H�yc�p��]���Lfv���jy]�3�Y���K�r��z��ⴴ�6��E���2O��P�cHO�@g<ɓ�5�p<����=\���W'y�Kjj���P�v�#�3��8�LF둭�&�Z�ԝg�ˑk�q�r�E:�ʳ��N�y�	r���yPk��7��u�щ�.>���U��ʲ��Ey/���q�)\]�S�R>|=��VP�p���!��D��-������*���?��n?3` ����_�Ń]��<q�#���-��Gu��Ox� '�������n��I�5��K�W;I��:I�����[�n��X;��?����S��#��9�[.�|�*z��o{�Z�<����M���p&`8z���7�*�>��S���J���o�Y��/Q!F�����˶vi4l/������癣�ڬ�z�)90� '�����)��W
�ITx{z*�㕳�Xz�]��Y��.�LV��.�η�Y;�[_�9}�����1���}�/�VJ�[�x)�^��l���%тˡ;�
�����-,�f�t������Ozy��b�Ȑ{��&o�$�<���_D0t��z���T�+.�H�$svם-'g�cm+^�|48�}5s�kx�? N�Qf��Γ�$�0+ҪCɘ*m�JòA���TP��bw:z]9OܲZ==褢�$!�5�d��V������XF)ԃ�(��EH>�o��	p��46G���Mb,D�atg��v0�o���z|H9�}=��Z>��@N-�]��dDW�?x�y� �E�b�!ɱ�[�5��PW��E!��o���;w����'K���Z<���4��@?�  #��9���" �a�ډ�X�/�/>:��{M� ���̦6X3�xtt�3�6�b�����~p����T�WٗOT���Jא��4����o�-��uR�C�SQG^N14g�0��{}�i����f|�긭�-���wp��/��|�*��!�YT^�_�#N��덵�W��}��X�v�3r���N}�I7v�F���o���16v�#]�w �Q��z+��ۆUNbjY�'���Pl���җ�n�B�5J��� Ő_��ؚ�C�vߋ�[��/% �*������+��}��W�,����ƻh{:�2�!�;�0�~r�#�8���n�N�s���˖L�9��Ӳ�����*�Z�д՞�%<�ؑ�ūe����lU���>ЋE�8����>XT�}��2�"�Z����t�6���7-ϯ�H��9q����̓��sݽg�����&Y�M�I��.�$�O�D3C�_jb��\$�fx���_�.�f!
O�JC��J��p&;�bk#���{��ٟk��w�V͹���?��W/�h~A�FZ' �I����Cq{��pz{	ou�u�Q��>����&��[WY���ax��w4?�JI�*������`�t��1i>A��B�2��qɇ�V��S_�W�0���T��)��8��}�������^�Xڕ�:!f��o̗��<��%��nEu(�IǒZo(�ڏ�7�x�;��+Roۙ�U�6��{������xS��T�N�	���0��I�� ȕ���/�l�+|�?�U��n�tnkG9mZKk7_Y�C��M/�s�-+a��u��6�1Z��C�k���p4�`�����P,`�S����ZS��]�CI�����^k;�}f�k"i^�1X�vc�5'N�;�܇@�:����|Z�9��+6�T@�bV�n�����_v��t�����zS�U��5�R�H���;�� ��ڝ�Ot�Z �}��	�x��J"C-���D����~��Fk��LW�r�r�%�r��t��ՔW�&VyaY�C�y�V@W�i��A<�E��1Z����W��#���^��9m�N�q��Ǹ-��{6�bmd���K�k��]~^X�E���	�t:I`ən��3�F����w
�U�jz%Gv4�%����
{ݖԑ!���^�r8�,n93�&@�׮$�Y�W>A�2����h���	��V��ީU��p�M��
�_�:�]֎�O��&[�(�GȊ����.���J�y��}�U��s�7�r'�U�i���9T.�3v&ܡ�Q���r�U�ctWOx�u��P�w��*��!�ן���?xڤ�z�1�e�Β4�����T�H~-ٵ��Ѕp�k�wrQ��`���:xQ�C{{�{�x�����x:pG��<x�D��:�B��Ŧq9��hR�S�����5����O{
:�)�����a���S�>���I�={��!%h����UW���_��pcJrؘ���ֳ�n��ծ�3W��eeN�h�F�-9�[߯�!3�S�n��|9==��	�Q��R*�W{��0�b:��g9|gp��2�M<��"
#��} F�ŀ��Ӕ�s|��|�Z>���Tb��9��T���XEl�R�����*%�e��k�8��)� �e��k}�q��S��̶�ѭ~�ML˗�
���/�`��J�r��C�~a�q�?Y�6�ӟ���3 ����ؽ�:&Ǹ���Ʌ���r���S�.?.A'B�����"���ÍqS���2�C�ik�0<���λ����|�w%y��
>�\{�\���d���ӎ�U�(_j�tS�L; f ���m�jɟ�k�����bX�t&��9p%7����;�I��&{�ѱ~}�iU�fb���O�+r"��E��d���h׊S�B����H����W��zƲ�16�q�܏�i;�?EYZ@J�)�_��T(D�g����4����Z�����u���N��ځ6����º�R�T��Po0�R�'�Q��z�,p�k�� �E�F���vZ�ϵ��d����)Qk����ӊy�7W��~͙L,���6�M��8�jq:� �C�O��E��U�@�;�E(����l�kk��s�8/���d��"��Ez]=�)��]{���<�%�6�_��54���l�3�(��:]E3��tU�Xg�W6Q�����c���|β���F�g��_h?�їq
���<B_�q���(5K���:��x��\̴x���b6���^��0cG�'�Vq`��֤���ش�k�o�Ik�_�|����"�/���C�3<��⿈ۈe�^�V-X?����5�:?:�h�D�1#O��Νw��7�a��s+=    ��d_�:IS�=�b��s��ޛ�R<�ֈ���#ϸr�(�nG9��\�w�7�<���c:ݝ���	򒯘�)tn��䴇�ܶ�Pe"�Be|�g��Xs����'j�N��D����0�tqjA������?0��K��������
ԍ�"�"yt���j�}z�y�V��[��z2��b�݋����S��d���V�����)�4y�0F<~�D�U�&G�1��TwV���Y�O��pn��:��3��l(���2[*�#8��5>n���iiU���X��O��#�Il�XD�GU�K
ܭ�~9w�/�}����`Ց�+�]o{י��(6�D����iU��r�_O:.;����Ʀ�5��K�@]��/��r�[W����(�#��X'��f��֖>���	:e�I�!Q�o�
� �+�=��E6`�2O�{L���<LV��|3W��co칣��V���1�%O�cm�G�P��S��ʕq<��K���efJ�nHbr�yLn��7��ll����� Ԛ��v���M�U�Qd�$��7Z�]�b�}�L�FJ�F�8�p�1b)==�N�1�>���՞}Ë:i�nt��y~�Oe�_����6��r<;�=��5{����NM�Ot��3�����Y��F�IwjY�֤{g�����F4Z!o���smkvn���}�O��<�OQ��Xb��:���*���"�
������f|�Z�����fQ­ڎ;8���HЄ�~炉x�����:w�ꗒ���f1B�9�@��������	nV�$n*yUgb��hp�W�]��"r����j���d�)�x�c���&���V�S�7���n�Q���0
X�!�����-q��x��O�3��3���N�w�7!N~�N�%�'C�ԯ[�<��d�:&�b��X��Q	��ry��i��յ	y�:�e����0�7N�ǚa�=|�	:��n��A^�e_�IS�#��1E�<�V�q�L����TVmn��(���bYܵ���&�f>�J��u��`��	���8
z��q4L)cHژ�� ���Ր��t�NH"�z^����>�E�s-f��f�Npm��rzo)�R���]	�$UH �M�1�>E����Wk�t��o���ޞ#g����h�4��-�m9�;�[?hU��ϊ$�d���l)�E��_� A������&������TZN8�>�܍�r��
,[�k���M{�4ϝEd�������>0�z�K/:]�qT��o�-O�{Y��� �ڵ����x�f���z絝^7[�"��[Եw�a�`tj��U�~�ß����i�Y&i,�@R��7uT�T��u	ԇ?��|w��lp|��a�{���_M�7P�i��/��=�"��]H>Q�y�NSi��^���U�i'���:���,t�Cy����`���[W}�C[�y:�4d�T�A	L���T���K�O,���!f��ƺ`췙�(Uk�]��4՝Ⱦ�<�?�s��1s�R�1������ 
a#�Ҋ���^
��ʥ�MU��ͻ�\���`���m}go���	��Y˻G��$��9��z��Q���<ܯ��%/���5���%�2+�Sɋ�ME�)2��gE��o���5O��p5g�=鱝�x��ǣ��l�a\�@�������C�$���J�(x�����W�y�r���{b��[��ie�7R[��	�,g�pt��թ�%��>�O-H�!�В�';�KH
A��/JT����ҿ5.i�k)׈OK���3�������If���ٝ�ǅrZyq��a�����}]�{
Pv.���7��m��\�,��ع���Q�X*s��zJ�����C�m�-����������*gf8J+��������Bl�
g����Z��	��M|��{��bb��_��#�-c�����C���<������o��|"/�8�|����){����37�|�	1	r�V�y���Y�A$�CۜZ�<���ȟ���w�!��r� շy	�*�~�Y�j/|�:-p�&N��(rV��R�:�S&�n�{oOSx�N7FK�r}x<���2�B����2�j\��k�����b0E�TW���ິy5�����+V�E�F�NF��j�d���fS?�%� M6[����*@F��gKl~�mG����ҿ�_.rzO�ֲ�!{�p�LP��LXp��m:wa�٣d�sc�>�+Ow}:\���H�����r}����m��a��cr����u�oγ�4����r��n}Nf9y�z�ײ�繉�6j����E�rџo��O��7�1�Wk0�N�Psyum�>�(1���̲k:�}u��\a0A�Q9�"	1�ee�w����<�r̳��X���Z�.#�|�VF�uQ<���jJ���ծ&���^���]�R��3��� %c�<E�S_+T��l9a q��r�t#��P�˭���S:���%z7O1wՔXy����2m�����2�2��Vp]OT����g �X��Bc�t�4�V�l�
����j=�����L�}@���X�ؙ;]J�e�կ�R���sB�[��,��`��yE���*MenjфݳK���S2tt�N2;���jܛ��m
0����
��'��-��`X$|%�%K0	vz���~�.�V_�Z���&S؛�؍�p�1*����j
n���p�ȼ�\)N)k�˩�MC�h�}�l��.����'�r��EJ��7fl'���	*�D��IN�-o�Dx�����h�/]F�G\�F�C]%�;8�v\����4����'T�o��0t�3͍��a�߶,�=���Xi��8���<�iSk�922��J��`f'��������dʀ&TįC+�1����I����7���%�Z)K�ls��I\��Ic�\���Y|6G�u/?B�J�<Ĉ"��%6V)����&��k�6m㩻M7�#:�6s�����e	v�bg�	��������,d��q�
<`�IBc�	z�ILYAN�5�)�Z�Y}��2�OXk�����R%a�[Cڨ�x6H����RW&P��e��'H��
�@�W֘��k�����q�Õv�ؓ�H�ӅS˭�X^f�|9�Ѯ�Gpp�Xȟ��Ħ�k�� /��LOuc����Yt��֢�2Y���{�~k/��g�c�BvoC��o�宅����ѩ�sy�!@�}O�m$��������!%J��W��o�~��3���h�q ;��m�ε�HV��PD�MP}%@^�gK�<�!k��j^�*zh���:��궋���6���B��e<Xכ��;�aL��D,���Y��#:�%0��`�"�r�Kc�����7�zP��@���Q���ۼ{��}�m]�8ڹP�L�I�|���}-��K�DN~Gd*�� $B����nc��o��"Z5�~	�� ��s��ƧbO����A�|-��B(3Y$���Ĳ�������w�{��7����V���e�Zmc9�F���K�j��c�dvW�t��ұ5��wCw���lN�Sn)�+���U|��^qq�I�	r*�^}�5_����.XS��h	/־^6p�!;t����ē�����Px%���_��1�8Eȼ)����� \+?ٛ�����J���w��H�WF�Xb��v�B�?�DHK�*�=�"�~[�,j�1�a'L���+((�G]qk;;?��8��Y�ȟ����Hto	D�� r��Z)�V䈳�Ps��J3��7i�/�ը{��w�ހ���thu��t}�;�p���?�L�A�����R�,��+?�w�N�b���p�x�]�f���H�ߦ˿@���-&�vS������0�\�+�vVϟ����V�qZË,��-+��t͗���5�]���0tX�΁���i/]�q؇�����#?H~��Py cX�L�z)�B�/bX�O$�~J7��~�5.i����E�Т�_:p_�wM w{��N�d��G�N���(�W7y��� :ɢY:\�\�^T�    �'��@o܈�Ы%�7�����}j튋�����sq���x\�����:�A4���G���s�d�~�L�X��`n�zF�p����*��p���BYw�If��T㌐��7����/�a�x��,�K�4����)�q9�%�w�f �+
��]E�(��j �����0�=u	������]��.��Q �?�~v���^O�
����;O�\�o@��S�8פ13��0��q��\����4�g�8*6=s��3ϟ_���O�a�P����ɋJz-��WPx6���5P���W�Q�x�3�s6�����";\�]�����y�!У�ue��Vۮ�MK�2�Dd�|��!��U��f[����v��z�����t��F�ܞ�g��z�'}�0枆w��d�޳�(��1���*�&S���$Y�ٗO����8sr��6�h����v%љ�|;���w��O��i�G�'�|~8����2�o��ɰ�r�V����!�JR��i��
�M��B�խ(�řuF�Q�b�}.���8�vdՓ�Kse����)na��tۿ�@�	EUJ��{�Zٕ�俰�J�a9[F'��5��&;y��&�b�O�����j3iщ7Y���9�_X:���	��%U�į�H�D�#D�W�1�:1m/��S��؇���&r��IOl9�Њ��n��ɷ\�
�0Ћ ���!�H�ϟ�mܒ g���[+��;ypuz[U�Fn"�WY�	p�aO]>[2Ks>�u��.�*��˔=�r�X�Cژ����Y�/�4��Z�ڃрٴھ����	#��-泖�S�i��u��ʪ�g�/<�2,I ��O�ʑ� a��P˦�kAu�*�,u�jd��w�4�����y\�y�a���uh���Eш	��_i維*����5�b���qH �;��Pl�5������w::g9��tQu����U�UB�������,j�D��o�)#�j��.� H5ғ6����m(�X�}<n�i�93$<�8ה|��du��D��d�ҧo~�t�e��
CP��a��nG�;Pr�џZ�{��ո���"����iQ5G=\�?ٴ��24�5N��oWj8c>?� ����F|Z��Kghoω���NT� ^Q:����s�x����iG~u�K�Q�jzd�Z��9΂�)��%���g�����$��x4�c��W����_�o��իV���q�:�~5��U�᠑��S��:bͺz��|�ٲw}H��_��5���"U�Zq�f>C���G�w�j�)�}NO�PV[F�&UG���N:���V�{������#y^�@�]��"��ކ����X��͖�����,D�n�?Et�;D��z�,����o�jD^�q,�#n�7U�YY���<�'l�>/Hx�������?CBy�OY�{�v�'c�双}�k�nɣ�X���ɖޛ�#�9ѷU?R�:՛�td���_R�ب�D���!N#>���se{ 6<�������{�U�a;���%���d��+f_�=]Ygo����{6��	��!�qs�O����yö����,w2�����4�8��sË�L�L��P�����#�>�[ף?����s�G�e*��e>��,boq)�b���lA-Ce������:�`��V��׸!��~��qc���8u��8f<Mw�,��S=4�V�?�p�/"�9����������w��\�_�?�4�C#n�صg&C|+�ڦ��{}��L�X�L{�#6������0��p��[�Ay%=3�;��w�P���_b�4ҋ�C�?Vn<B�O��f�M�HoW?���Ȯ���ȹ����a֭ fX�A�O�>b�x��x
͖��臩��d�R�?�=��Ha诚�)15�{�{ݝ;�'[�����2�)�#���o3����V�wA���eLWsi8+-t˹�9?v�y�;��^G�2=��:�x��Ҏ,����j̽�q���VU�ٿ��o8��&"�7���J����^��_=�QQ����*T|��*]v]�����4ďE�h��=�S8�%�ѣ���<[0>��E?�=���~����h�mt��6g�`�NS/�W3䆲�5���
'��㩲�n���˝ G!�癣�=�<s'�i�%���)�7i��sO4�mu=�-*m�k�Z�B�Un$N�L"���K�}j)������r�/�����*��D�x�z��Y�n8䖜��Ƕ/u��>�k^�3�'��ܞ��80��X��n�1�,��]I,I��%mO36)�6�T�P��8�������r���p�N]�d�o�"�1SF���R�_���#0���H*�d�
�U�K�R����w��P�8q&v�ɱ�\��b0�}'��:��V�p7�7*�5�u����ҏ�<U���N忨Vz��F����2��h��ᢞ�����g��tg�Z���|H��2�4����0̿��w��^���{�&���s��0<Z���|_���4;� N:��S��J��/̳7�rw`�� ]�������9�}���N��ٹV�z��������Uv]m�U�}r�Z#�*���b�oD��9=b��ƈ���3�����2T����*��`�)x ��ѿ#͐�l�+"6;��Qg��W.�E�U���³��@�믤l^&I��ݮ���U	$�r<BI�]�eyc���=���x��@J��|�����j�8җC��G
3�,V]�쬗�=�.��=)���,�8�	4��>�ÌC�(�K���h�Iy�{-읔(�����lk��/�,im'�q�4_��(跲���)�	pn��Й������^��ڒB��h���3��K����5	R<r$�:��$]D>��3�Ŷ��ڻ��#c����ު��ѐ�`lWם/Ny	�V,9�<�k��V �݊?У��ggAdg����+aZR�m��3H\|]5e�qK��;�ᡡ�K߆�ox6+8.��r`
� V�۬�frY�]y¦�`ޞq&w��͊R���qb�
��եN>!%��JA�F�Ϥ�#�,���_�lѪ �O�~�8̻<5��2F���iN�T�n�)�h�W�-��������P�(	WB��q�_R�5T�g���_܁��/fV�]�|Ki�5O�lN��$j3�(�Wg�p@.�<�=�\k�'����\��	[R�����ڛ�R>�������6d�i��j�A��㷢c:Ѱ�.�M�p��q����1xK�!(bexx2�FWb�H�K��#���-��|��)��e�k�Ei���J�i��,�7Z��O	�}\�-�=�㺩t����o��#�ò�>"`̊��w���%cJZRAN��������z�J�sN[E��y^�[�e��?�r?�3n�_����l��h�~�=N�J�K �-OLؒ:(�ҹ�X�l�a�m�8j�j+���hdN��`S=s�y��`� v�gy��> ��.�4F���Ce���
׫@D&�w&k�U�ߔ�ܩ����U�s<ƛ�;23��h��LR�?#8|���\"�0�s�+ �N �3ْB��W�.���Z�[����ʨ���l�ή�t��әyp׶1L��J��菎��{�	��k>�Z'sk�0�l�,�(A��%���R��4��~:���f����e{u��B�vD��fە=8��S�Qa8��K:��{��p���G�s"�)"76�3@ZR�����A ���@}K�^��I�mOg����,�r�"T�؝��Mq��a����Jr0ߣ���ހ�V��ÖZ2��cZۦ 0�f������\�z?���I��
�U�����ܥ�4�h���l�.g��WR)O�������ZR� Q��� �����V���+�e�s�E]VG��Ճ�f���K�92����ր|@�����b\ʋ�	W���*[��̉�6�c+��E9��CA�v��f�j�g�3K��\1��Υ�f�����r�� �ܷ!vV��\"�H.�h�rV�:Y��2\���}�B�nz�Z���r��t�	Xޯ�c68U�mU�**���s>�� �Yp��g�ϫ3��# hIA$    ��2��԰�v���>�iÞ�3B9���Ky���BK6�t�Z$�[��������BP�!"���q'\IA�Z~��h�]��W^MFL�3�L��f�����3��YNսv�Y}4���9��%yY
A�	"����C���y6_�%�N��paS������������-Y����6;�&�O�R��&q2̶hc{��F�VH�ʳ�j���\w�V8�J��mT4)��S�;������W���ғ쬳�K�]�ѣy��h-{_I�Y��fW���2ł�?`2P��x�0'�J9��p,	l�r��P�DS��{7�+�r�O�YG͍�l�<Nkj�x*b<�U4��o������I&`����8I,����Ġ_�$U�(`�)����r��G��tq���ue��0<��z�dxKu.�e�Q��P�p�������8"q\q�"�B�OtI�Cu�,�m)�ًB߇�6f��
�am�1�=�*���v�^�0�#ό�kqu��D�r�M3L�l�9r%eDrV�X "�;/<��ACY-W:wL��Å?��؞7g��fl���e7�E���OSH�9�&y�%�����X�4�����=�9t3�Fx�����J�;$D$H:\�κS������G����&�(7��/x�ſ��`�!`,!�8$������l�M~���R�cc�m�%��,�����n�]n�r�״٥^[
��a}�-�ze	��E,x���+>8��E?<8����ؖ����Fgb���n���.u�A{f���=\�l���Ok[��񕬼�3Ś��P�k�w�Hӻ�%Z��^�(�n�;�J� �v��׹��A��⮻�?K��H_X�� ��D |D���r��AW�u���*����h����S397�y�1���3�T��B���fׯ&�R��y	�3���=B�܆e��;�вb���>2���#ģ67'�(�x�zI-;z�̮,���	��eh��f�UWx��<�����0[��G��8.+��n�8#9��{��3���v��8������6h-�n/Q��aO��EF��)0A�z�C�C�D^�A��4��"�C��d��J��X:�=F�v�=^Jڥ�����gl07V�pQ=M�e��=k],�y�U��j�U��,&š�c*��9F��%5C�s������������*μ�{vs	M�1΍�!Pf�iĺ�w5#r1d���1T�4:~�y�E��`oB%�"�A�xV䍮y}�;^Q�d�f�u��9ǫ}g w���<t+����BS9�.)V���%�~�X��ܭ(���	
jW��7��Z���t��z$+8lO9/����Nf����K�^V�l�ԐX?|6�y�E��ǘ����י�G�d�x-�Xϼ�z}�yR)��G��ӡn�5Qw�LHG��x�`|4uK�>�Hhl�.\��5��,ݚ��ҭ	�L� ��� �
���B'c$9;��W5~��xRe����c���=��4�I����
]R���=�F����N��*�" �L'��L�ʈN��� ޺�WlO�yf����IWC�Myo2Z�-U����I+�c�.�����!Mw�� ��Y�"{�F�l_�Rn����<��iù��8�a�E��LĬ*�wd|�f�$Rb�XeY,X�%uč�(�o7�F���9i��zpJ�5�ksAB���T:ȣS�
�z�m'�o��)����n�
_�}�Z��2T���MkȄ]�+��f��l�ߎ*�CxŻ�n���d��g�u�\�m��M�JP��	�'�ې�� �$!*P)�t+���!���R��n�źү�n�5�ѭ�jS�јf��v�����fی��}��/ީf�o���RW*P�E�b38 K�ghDk�u��,����?T�1;�W3Q�ڡ�p�lttV�G
�r�/0W!���8�;Xq<����[C�;����j��w~�w4�Bgp�\_��#}$
͉����Pu�\�1�8�5��&]��30h|��9[��*�k�) �R�k�h
��;�gV֘b�fl��:�y�N��i3��-o�Vs�U��ALC�X0��^ �(1�|���K����b�,/(^�i~���E��W�O\���؞Ԗ����ܪ��i0_j�Q_��~:�,�~��'?�/iL�`V��Wp)Et#󨖗�ɠ�ݩrik�{؜=2��ckC�5��b��N�^g�Ԗz����/���=w ��Wf�T����dQ�I��O�n���dn�o�5�?��b�U�P
/���-��ۛ�� �o�L$|��R ix�2) �)��L��]�.�ܷ}��D��ʯ�zbu��PekD�+����M�ͻ��]�1��=��K)
F�*��B��z�}��=6�j���B��n3��vM��I��xm��e=@�6q\�]����н�w�'�}-����y1�l}/߂�ZW-�~p�������3�����h��X�NⱡU�`W��Q���$~�@���mp���Z6���0��M��2��j�'(]q��խ��R�.�p�F�����4Q��]_6�f�����s�������'@�@N�S��C6��OBp���	� !R����@
/�����Pp*�w�Ͷ��m��ˎ���x֫z���(�#��F�yu$�"������3��<�D��P*�ֆPd��Lf�Bdߞt'�]�z,�[��W��-��n����({ު�2n�썴d�������R	�$N��/��V�`O�z���顓�V=����,�im�Oz��O^O+�{4���M����y�hO�J����a��,U��򜨤#p=PD����b���3�ߞ��q(9Ճ~��V��^9��tVU�L82�̢�J�F|E����mR}�ׁ�p����vf?��A8�ȷ���L���\��Z���]�T���HQg����T�+����(P�0�#'�s�XR����9�JJ�Tj&�����k��͋v;�=��n4�#�d�ɿ���Q����I*U�2x���rރ�f��is$p8`n�G8��	��� �Sc��CR0����u�	� 2tӑ������+�et��KEUF~��>r�zSj4��AK�h�q�pr�4N�s��{�>�X�i.)�rTȕ߹������ǧ�+m]����حES�z�NB۝荩6:�R���WLHQ^̈́���\�Xb`�d'��'5p#��@�,�f_l�I#����R��pP:�>���e�I�H��/���N�r�>���'�iIݓ���.�wR�E��G�k��)���U[%U/�H�q����1�h"�ݦ.�P�"�{t�'4*	Hd�����_���k1%-�Ms#��Uލ|r?x��lp����Փú�H�\��_��̀��g��,���q����\^?JU�������3pw�;_����T-xu��RbY=�9��<�^�#���~^m�����Z�|6{�c6xp��T�A�`ޚ�!.W/2��&�剟��݈�����o[�iU���pm���F+!�fNx��u2��=i厬�ߗ0��~p�Pd��9	��#^��ȕ&��M�=	C���{�gbq�K�b/�J�Y����<��D��uP1�Ss�}��FL�SR _�Dx,����=q#��syb��܈���3q��6�l�6r��¡7ُ�.��uW��[�v��t��tE�P)U��h�ID�/p���]�KÙ���n�x��lu`���9Ⱦ���ضj�2ukJ�ڿ��J_�{7��DE��	a��?Pmz3��	�D\���^�H鮏���׭���t�{)�V�0��n�e�n��M��x������s�,H�fED��[��5�'2*"^<E|&���44̮O��&�/���V�c�wؽ�W��.�Q���	�6��Q��b�8.�_�P��1�=Ay�����ۂ��VcؙL/�>���θ4�k N$SL���ܨ���b��=H�$G��	8�?�(0�7��x�������3p2r�N[?1�E�΋�@����yH��,�\ìJC�wa���ȏ`�0���Tn�&������
�E�3Y�� �  n�zpY��*�8�����8�{��H��Ydw����+�+�r.$��!�~B�!G�)�Z����٥`hG��W�v���0NÑ?��a/�Z {���(�Y�������ý�������#��W��r��l�@����t�WÈ�O���b�Q<4��"���8a�Cz>G�@y���D�7�XO0w'*�U�����;���j`�^�aXG5�{J����]��:����lz��mj������o">ow*r�Bq(7^D�f)h�|��/ȼ;h��ٰ�ݩ���ߋW}ˌ�ݸ3~��G��q��~r����#�����r� �dT�Fˉ��m$nr�uA^�dH?#$���Z�&��e#+�e]nZ���G%�p�)Ig�YT���L�J�r����9�I��Ω���{,'tԑ��ߚ�+��_��ph����Or�[�R��(����/}	,��gq���}$�@��K��HS��~i(� xkK�U�ھyX8㑹�����K�Fmk��A��1�ݰ�>���Ce�$�|O��`(,�1��)��{e_/]���m6��Q�Z��i���r��<�4,��7��hU��j���/��/�$����!0g���O)i��![�j�����CM�,�S[��z{r���l�|�keY���h�n�-��+������N�M������}�����dZ�         �	  x��Z�r�8>CO���9^o&U�l&N�*B�6+��Of�8s�Þ��b� DH��8e�$��F���n�ݛ�&ݥ&���_E����_��]mwi�(�|�Œ� �5��T���
Gc�EԒ�U]��E/�ǁ%�
����ua���IZ���8�wI�_?鲾Ms�V@�ڗ���X�f���ܘ����G��%f�k�֌�R���(�d�����Ĝ
Ѝbɣ8b∊�5�CE�����I��ɷN��Gq���𥉉���\���?�Ly�t*�	�5!�n�n�
�#I�T=HI�����j�i}��-����M����s�G�Vn�(S������ўH}lrP�&x��P�\	�����7eY�cM� �|,�ر깪�nn��l^��$d�Eط	��)�"xoʴ��!�ݜa��:�5�]�iw>m4�ܺ~�K�<a|t~N]�e��0��R>L؍ Og����>(�]gE�{�@��꿋�����G;?3~؈W++�0�r�w tU���c�قŠ�[7w:3yD�d'!	�Ӑ`%�S�_�i�1J{Ȣ�8��,����B�������:�s�y�" `�H
�IY,|T���ޚ*�J���?�4��2 �}�T�����z��� ��`�px�3aA �׌��9Ҋ��������%��m��t������G/�5Кryf�{,�8��+�0#�2?k1� r�"��Ԡѧʔ�O&�:�uDGO��sR��gL���x���ܔ`�'��E,�{K39�	�O��B�+����tY�RW��7`�����R`�Q��%�5f&:��zAn�!�9��OZ ���fC0������$�c�`oѯ��a"�X*/1c�����qD�B��Y� ���A��~&~_�lgԛBuq��l��/}آc��{S�i�X8�D�pv�j��>/.x�� ��/JWkRĥ�����/;�}f��%������X���]������B��t>��� �@�68~���6�Nv\�}��EN�f4�d�GNN�u�d���=���7��[rN��!q$�`AFnMR�ߜ�r)��1���F[�.�NjgI���S�.��n�@D��׫|d���x_�o~�rMe��~�HU[AU�:�����=���.��/�e' �V:B�9�J��ҁj�})CK�cÏ�
���*�X�©������U/$K:��N�E`Žxx�l����-�z�T?g��Aⵠ���� ���mâ-� WR��j��&�ӽ�����	 �Xe������{�k"�O���!lx�d�=�~����b����AmB��f�/������؝���O"��PDyh��f��$��H�n�9>��[�Bm-6$��TޞЯEml��	^�X�
)��_]�2���S@��!����G�GPK<0�1�}u�Z��ᴛ��C�l%����������C���"�Ղ/��K����rV1&�.��U0��@;�-�5p�����i hݥ�)a/��s9�Z�K�)�뛂�	�$H\q�ve��F�wh�Wn݄�N�I9���o�!!2���qA#���Ѥ�}V���K�:�C��1Y�:��f����y��[s

3}�I{GWA��Uqu����v�,��v�Q��Qq[iA �D��$�1l�[�j|O�u�#;Tӣ��&���U�P���A\�eق�(�lr��#�?Π������^�F		�TL^J��Z�/�c���5˸Jw��(}����^I��O�?{� }�d��w�u�Yep��F����I��&�����	c߈c���`�1;*�%�>�G���BWT&O��S䪪���癙cޮ_�Tr@�9�+) ��fg�4.��m�.ix�z��v�|�0{"��{Ψ
]Y��H�w�:�*љF�H?�B��[Y���=����f�[n�hN��UH8�W��"�v&H�ѽ���7X7%��9�hU��)���/���˧�+K�)�l��vy�o[�OU��˦o!�I~L��O()?��Sv'��X- �?�P٫�C��7o��13W�Ξ�4�M���P3ަ�O��ā�&�3-t �LE�ȴj���bI�f�OB��A����vV3f�x�PW@[�k&ݽv0�����Щ��oO�˫?M�˹�c�9g<�"�2�QqJ@�� ��Ja����}��lf#h�F�LZ�ly_뺙����w��Ԗa^ܻ�k/tF�Ҹ�q��%�ғd����V�R����5�l�7���y���iU��ҕ�0���f�!�t{�>���T%DN+�lZU�K�Wxx������YR_A����	�5PU	N������l;3h��#0�2�SX�
flMh1GbA)rۡcx�A�cC�e���&`�fD!UDʡg��6Y1>�� @���1�ǒy��-l?~�`"�����P�C"٥mk3�6{GS���s��ԽnO�¿	��%�����a>�����欙�         �  x���M��6���)r��/һ^�'�M��@��?J&���v�����)��T�a��h���ן7���ъ��uU�����o���C��}H��Y������f򾐿������4�e�&>�/ +�
ڃ1fL�70kD��F#��i�,Z}�b�Z�����L`�}?��S�}+��s�}?��g/�;��ޱ����>���{o���[�hUZ;f�f,��'&+y�<�,U�x/!�1l|X�5>��,��^`���^`��!^`��/^`��a{�cy�����FҌ״d� �KN�����$_�z@��-@o�Կs�rw3�o:�U�y�`�'ᕭ�!������΂�(�N�)�]Vi�E�`4��O�0��qF>�(Ö-�`@s�����K]�k���0Z~vt�G��翋�=���50������qr�VHU�p�%թ�e�%�a�rg�p���%�]�W�U��ę���cJ���p�KkQ�Ph݀��iV��t6T6!�ڒ'�p��g_̘ײ<�Ի��ؼ�v�S,��q�,*�=5P+�9�9c�@7E�9��C(����ZNs�MF
A�5�=��R+
�HSW��g���|�f_�p�GiHy�[�
�{q�T? +9�M�=6�%¦]��K}ty�h�g�ٵ1�7�Z�s�cQB�J(�=|V�QkR�P9AY��m�^S'�c��Qň���<1c�aaK��z�@�Ӂ��H�Vs�I�\��whӹ�w)Ia*�������c��D"f��w���M��~4��^�k�Ґ��]����z�D��\�K�ر�ꫜ�4M=�q���=e�R�G'j������0��D�j���h�G:?Q��З'�p�X.����-�h"���)����
��ȡg�r�Izc6�� �gz��d#6��\���X��|�Y�86X���3�F�CS'gl4�3,��b�X�:iO1�E�3���g_��n��r         
  x���Kn�0���)t��[;��.�E�����+��4��*G��:Rd[q��.�g���?R�E�k�2�}�?�vS���f�V�v�.�&�
s�vl��-C�j&�L`*D�V�2�ˀ��f(� �R��4�>?��X����z�l��.�f�q�2v�j��e&�Fr#��>1lކrW��?�b2� ?�CU���W�т�\��a�5�����f�^�(�]M�?��(��P�z�E���+r��BPd�g�j�� �>U����#�a�}�/�&6���J.n������N
���8f&E�l&����D���!��0�T�,��E��\]�:�d3���Щ)%9��$�͛،P���Qd��.��a�8��2��1ȕh��ң�$����,�,�t>,�#�8f_d"Ö�q\�۫�:�H-o��)6ܐZ�G�V��пc�́/��<�޾������6\�s��)^E_��h�|D z�_M��QiN�۷F������^*r� �]��V��l��vZ8���$I����         P  x���In� ���\���1�vVU]4��aQ�P1�NYt�#�b%4�D�%$�����ꬰڠG/���x'��Z1,̽��B9s�����^�ـ��wk�C^�@SB0@ڬ��6���t!��L��6��ȶ�:1�X��~�*����*2�g2]R����l�
q.�3�b�Y?Fɵ�q�-5"�Q�PX��]��j�N���s �ӻ�P�'��(TZ���"vtrjoRX`Ҵ9ms�դ��:�_;F3���2�83��&�u��
�眻�/ ++X͟�,�r����_O�P
PӦ8n�H�W��ʖҬ,+R�_ٛ,I�0>�u         �  x����n7���S�T��p�C�d!(����-�.�*��B�S�O�Y;q$��C�v��o��9�AF��@��w�m[��S������O��k�uB�kN �<�)��Q�,
�uw�HVV��©xҨ\�w��/pEy�P���!�S����<k����7�Bׯة�CdMĵ�����as�О�����M�Lb�cE�m=�=m=c~%���@P$f����y%��
0 X�YM/�Tl��$����`��L������x�������xR��$�:�q%L,-c�*������B�d1B�7%��7{tlH�ٵyn�������SrN	�G� iV�Ӕ�*��*������ �ȧ��$g�,�����g����3A��Q��/�Y�ɉ�	�1%Kݡ�ڶ~�9Ի���F����Q�e�h��10*�E�k�J�����z������͛���ֿ������O��o��7�;H�؂]�Ī���2���8r�t��j��K��t�%�l�e��9Z�_t~����b�L��>����T�����]Ğ�Z�̖|���!�b���"�@�b��t[���`2�K����IY����}����~�:&2ZT皺HN��8�2�>�*~��`#l C%d#_J�8�I˅��6H�l8��>>�i�f�gOf.!�d�Jl٭	f�Bc�}:���ز�jw��YO�'H�����eG�21����k�Ə����/�nq�            x������ � �         �   x���1nAEk�s��a`�\ 'p)M�����(�5N%�� �����탄e�l;Kc�k�����M�/w�sWn���M�)�?L4��|��Qq�;{cI�t���ڜ�t�PK>R5����|,�,�FḟŸ�z5i�#ಀG����=�� ���a`���Ƣv%%"KP�Wͦ-$�*u,L41�jð�.���y*��p+&e���.h@�)b>*]4Q��o<�fJ��b�-N}۶O�k�\      9      x������ � �      ?      x������ � �      =      x������ � �      5      x������ � �      3      x������ � �      ;      x������ � �      7      x������ � �     