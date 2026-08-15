using AutoMapper;
using CampusAccessibilityBackend.DTO;
using CampusAccessibilityBackend.Models;

namespace CampusAccessibilityBackend.Configuration
{
    public class MapperConfig : Profile
    {
        public MapperConfig()
        {

            // SubmittedAt=InsertedAt του BaseEntity 
            CreateMap<Complaint, ComplaintListReadOnlyDTO>()
                .ForMember(dest => dest.SubmittedAt, opt => opt.MapFrom(src => src.InsertedAt));

            CreateMap<Complaint, ComplaintDetailReadOnlyDTO>()
                .ForMember(dest => dest.SubmittedAt, opt => opt.MapFrom(src => src.InsertedAt))
                .ForMember(dest => dest.SubmittedByFullName,
                    opt => opt.MapFrom(src => src.Student.User.Firstname + " " + src.Student.User.Lastname))   //mapping σε 2 πεδία του Complaint.Student
                .ForMember(dest => dest.SubmittedByDepartment, opt => opt.MapFrom(src => src.Student.Department))  //το Department στο Complaint είναι το Department του παραπόνου όχι απαραίτητα το department του student
                .ForMember(dest => dest.SubmittedBySchool, opt => opt.MapFrom(src => src.Student.School))
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.ComplaintImages))
                .ForMember(dest => dest.History, opt => opt.MapFrom(src => src.ComplaintHistories));

            // ChangedAt=InsertedAt του BaseEntity 
            CreateMap<ComplaintHistory, ComplaintHistoryReadOnlyDTO>()
                .ForMember(dest => dest.ChangedAt, opt => opt.MapFrom(src => src.InsertedAt));

   
            CreateMap<ComplaintImage, ComplaintImageReadOnlyDTO>();

            // StudentId, Images χειρισμός στο Service
            CreateMap<ComplaintInsertDTO, Complaint>();

            CreateMap<ComplaintUpdateDTO, ComplaintHistory>();

            CreateMap<ComplaintImageUpdateDTO, ComplaintImage>();

            // RoleId ΔΕΝ έρχεται από το DTO (δεν υπάρχει καν πεδίο) — μένει default, μπαίνει
            // χειροκίνητα στο Service (πάντα Role = Student, ποτέ από client input).
            CreateMap<StudentSignupDTO, User>();

            // UserId χειροκίνητα στο Service
            CreateMap<StudentSignupDTO, Student>();
        }
    }
}
