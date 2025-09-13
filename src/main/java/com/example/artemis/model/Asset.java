package com.example.artemis.model;

/** Simple POJO representing an Asset in the fleet database. */
public class Asset {
    public Integer id;
    public String name;
    public String type;
    public String manufacturer;
    public String serialNumber;
    public String status; // active, inactive, maintenance, retired
}
